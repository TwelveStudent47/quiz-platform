const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const multer = require('multer');
const { Pool } = require('pg');
const xml2js = require('xml2js');
const cors = require('cors');
const { parseMoodleXML } = require('./moodleXMLParser');
const aiRoutes = require('./routes/ai');
const { requireApiKey } = require('./middleware/globalApiAuth');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
const upload = multer({ storage: multer.memoryStorage() });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.options('*', cors());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  console.log('Cookies:', req.headers.cookie);
  console.log('Session ID:', req.sessionID);
  console.log('Authenticated:', req.isAuthenticated?.());
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  },
  proxy: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [profile.id]
    );
    
    if (rows.length > 0) {
      return done(null, rows[0]);
    }
    
    const newUser = await pool.query(
      'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING *',
      [profile.id, profile.emails[0].value, profile.displayName]
    );
    
    done(null, newUser.rows[0]);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Not authenticated' });
};

app.use(requireApiKey);
app.use('/api/ai', aiRoutes);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.FRONTEND_URL + '/login',
    session: true
  }),
  (req, res, next) => {
    // Explicitly save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return next(err);
      }
      console.log('✅ Session saved for user:', req.user.email);
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
    });
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  });
});

app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

async function parseQuizFile(buffer, fileType) {
  if (fileType === 'json') {
    return JSON.parse(buffer.toString());
  } else if (fileType === 'xml') {
    const xmlString = buffer.toString();

    if (xmlString.includes('<quiz>') && xmlString.includes('<question type=')) {
      console.log('📄 Detected Moodle XML format - using parseMoodleXML');
      return await parseMoodleXML(buffer);
    } else {
      console.log('📄 Detected custom XML format - using legacy parser');
      
      return new Promise((resolve, reject) => {
        xml2js.parseString(buffer.toString(), (err, result) => {
          if (err) {
            reject(err);
          } else {
            const quiz = result.quiz;
            const formatted = {
              title: quiz.title[0],
              topic: quiz.topic ? quiz.topic[0] : '',
              description: quiz.description ? quiz.description[0] : '',
              timeLimit: quiz.timeLimit ? parseInt(quiz.timeLimit[0]) : null,
              questions: quiz.questions[0].question.map(q => {
                const type = q.type ? q.type[0] : 'single_choice';
                let data = {};

                if (type === 'single_choice') {
                  data = {
                    options: q.data[0].options[0].option,
                    correctIndex: parseInt(q.data[0].correctIndex[0])
                  };
                } else if (type === 'multiple_choice') {
                  data = {
                    options: q.data[0].options[0].option,
                    correctIndices: q.data[0].correctIndices[0].index.map(i => parseInt(i))
                  };
                } else if (type === 'true_false') {
                  data = {
                    correctAnswer: q.data[0].correctAnswer[0] === 'true'
                  };
                } else if (type === 'numeric') {
                  data = {
                    correctAnswer: parseFloat(q.data[0].correctAnswer[0]),
                    unit: q.data[0].unit ? q.data[0].unit[0] : ''
                  };
                } else if (type === 'matching') {
                  const pairs = q.data[0].pairs[0].pair.map(p => ({
                    left: p.left[0],
                    right: p.right[0]
                  }));
                  const correctPairs = {};
                  if (q.data[0].correctPairs) {
                    q.data[0].correctPairs[0].entry.forEach(e => {
                      correctPairs[e.key[0]] = parseInt(e.value[0]);
                    });
                  }
                  data = { pairs, correctPairs };
                }
                
                return {
                  type,
                  text: q.text[0],
                  image: q.image ? q.image[0] : null,
                  data,
                  points: q.points ? parseInt(q.points[0]) : 1,
                  explanation: q.explanation ? q.explanation[0] : null
                };
              })
            };
            resolve(formatted);
          }
        });
      });
    }
  }
  throw new Error('Unsupported file type');
}

app.post('/api/upload', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const fileType = file.originalname.endsWith('.json') ? 'json' : 'xml';
    
    const quizData = await parseQuizFile(file.buffer, fileType);

    const quizResult = await pool.query(
      'INSERT INTO quizzes (user_id, title, description, topic, time_limit) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user.id, quizData.title, quizData.description || '', quizData.topic || '', quizData.timeLimit || null]
    );
    
    const quizId = quizResult.rows[0].id;

    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      await pool.query(
        'INSERT INTO questions (quiz_id, question_type, question_text, question_image, question_data, points, explanation, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [quizId, q.type || 'single_choice', q.text, q.image || null, JSON.stringify(q.data), q.points || 1, q.explanation || null, i]
      );
    }
    
    res.json({ success: true, quizId });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to parse or save quiz' });
  }
});

app.post('/api/create-quiz', isAuthenticated, async (req, res) => {
  try {
    const { title, description, topic, timeLimit, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Title and questions are required' });
    }

    const quizResult = await pool.query(
      'INSERT INTO quizzes (user_id, title, description, topic, time_limit) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user.id, title, description || '', topic || '', timeLimit]
    );
    
    const quizId = quizResult.rows[0].id;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await pool.query(
        'INSERT INTO questions (quiz_id, question_type, question_text, question_image, question_data, points, explanation, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [quizId, q.type || 'single_choice', q.text, q.image || null, JSON.stringify(q.data), q.points || 1, q.explanation || null, i]
      );
    }
    
    res.json({ success: true, quizId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

app.get('/api/quizzes', isAuthenticated, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT q.*, COUNT(qq.id) as question_count FROM quizzes q LEFT JOIN questions qq ON q.id = qq.quiz_id WHERE q.user_id = $1';
    const params = [req.user.id];
    
    if (search) {
      query += ' AND (q.title ILIKE $2 OR q.topic ILIKE $2)';
      params.push(`%${search}%`);
    }
    
    query += ' GROUP BY q.id ORDER BY q.created_at DESC';
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

app.get('/api/quizzes/:id', isAuthenticated, async (req, res) => {
  try {
    const quizResult = await pool.query(
      'SELECT * FROM quizzes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const questionsResult = await pool.query(
      'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index',
      [req.params.id]
    );
    
    res.json({
      quiz: quizResult.rows[0],
      questions: questionsResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

app.put('/api/quizzes/:id', isAuthenticated, async (req, res) => {
  try {
    const quizId = parseInt(req.params.id, 10);
    
    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'Invalid quiz ID' });
    }
    
    const { title, topic, description, time_limit, questions } = req.body;
    
    console.log('📝 Updating quiz:', quizId);

    const quizCheck = await pool.query(
      'SELECT user_id FROM quizzes WHERE id = $1',
      [quizId]
    );
    
    if (quizCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    if (quizCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await pool.query(
      `UPDATE quizzes 
       SET title = $1, topic = $2, description = $3, time_limit = $4, updated_at = NOW()
       WHERE id = $5`,
      [title, topic, description, time_limit, quizId]
    );

    await pool.query('DELETE FROM questions WHERE quiz_id = $1', [quizId]);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await pool.query(
        `INSERT INTO questions 
         (quiz_id, question_type, question_text, question_image, question_data, points, explanation, order_index) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [quizId, q.type, q.text, q.image, JSON.stringify(q.data), q.points, q.explanation, i]
      );
    }
    
    console.log('✅ Quiz updated');

    const quizResult = await pool.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    const questionsResult = await pool.query(
      'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index',
      [quizId]
    );
    
    res.json({
      quiz: quizResult.rows[0],
      questions: questionsResult.rows
    });
  } catch (err) {
    console.error('❌ Update error:', err);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});


app.post('/api/submit', isAuthenticated, async (req, res) => {
  try {
    const { quizId, answers, timeSpent } = req.body;
    
    const { rows: questions } = await pool.query(
      'SELECT id, question_type, question_data, points FROM questions WHERE quiz_id = $1',
      [quizId]
    );
    
    let score = 0;
    let totalPoints = 0;
    
    questions.forEach(q => {
      totalPoints += q.points || 1;
      const userAnswer = answers[q.id];

      const data = typeof q.question_data === 'string' 
        ? JSON.parse(q.question_data) 
        : q.question_data;
      
      let isCorrect = false;
      
      switch(q.question_type) {
        case 'single_choice':
          isCorrect = userAnswer !== undefined && userAnswer === data.correctIndex;
          break;
        case 'multiple_choice':
          if (userAnswer && Array.isArray(userAnswer) && Array.isArray(data.correctIndices)) {
            const sortedUser = [...userAnswer].sort((a, b) => a - b);
            const sortedCorrect = [...data.correctIndices].sort((a, b) => a - b);
            isCorrect = JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
          }
          break;
        case 'true_false':
          isCorrect = userAnswer !== undefined && userAnswer === data.correctAnswer;
          break;
        case 'numeric':
          if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
            const userNum = parseFloat(userAnswer);
            const correctNum = parseFloat(data.correctAnswer);
            isCorrect = !isNaN(userNum) && !isNaN(correctNum) && Math.abs(userNum - correctNum) < 0.01;
          }
          break;
        case 'matching': {
          if (userAnswer && typeof userAnswer === 'object' && data.pairs && data.correctPairs) {
            // User answer: {"JavaScript": 0, "SQL": 1, "Java": 2}
            // Correct pairs: {0: 0, 1: 1, 2: 2}
            // We need to check if userAnswer[pair.left] === correctPairs[pairIdx]
            
            let allCorrect = true;
            
            data.pairs.forEach((pair, pairIdx) => {
              const userRightIdx = userAnswer[pair.left];
              const correctRightIdx = data.correctPairs[pairIdx];
              
              if (userRightIdx === undefined || userRightIdx !== correctRightIdx) {
                allCorrect = false;
              }
            });
            
            isCorrect = allCorrect;
          }
          break;
        }
        case 'cloze':
          case 'cloze':
          if (userAnswer && typeof userAnswer === 'object') {
            let correctCount = 0;
            let totalBlanks = data.blanks ? data.blanks.length : 0;
            
            if (totalBlanks > 0) {
              data.blanks.forEach((blank, idx) => {
                const userBlankAnswer = userAnswer[idx];
                
                if (blank.type === 'dropdown') {
                  if (userBlankAnswer === blank.correctIndex) {
                    correctCount++;
                  }
                } else if (blank.type === 'text') {
                  const correctAnswer = blank.correctAnswer || '';
                  const userTextAnswer = String(userBlankAnswer || '');
                  
                  if (blank.caseSensitive) {
                    if (userTextAnswer === correctAnswer) {
                      correctCount++;
                    }
                  } else {
                    if (userTextAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                      correctCount++;
                    }
                  }
                }
              });

              isCorrect = (correctCount === totalBlanks);
            }
          }
          break;
        case 'essay': {
          // Essay questions are manually graded
          // For now, we check if answer exists and award participation points
          if (userAnswer && userAnswer.text && userAnswer.text.trim().length > 0) {
            // Participation credit: 0 points until manual grading
            // Teachers will grade manually later
            isCorrect = false;  // 0 points initially
          }
          break;
        }
        default:
          isCorrect = false;
      }
      
      if (isCorrect) {
        score += q.points || 1;
      }
    });
    const result = await pool.query(
      'INSERT INTO attempts (user_id, quiz_id, score, total_points, total_questions, answers, time_spent) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, quizId, score, totalPoints, questions.length, JSON.stringify(answers), timeSpent]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit attempt' });
  }
});

app.get('/api/history', isAuthenticated, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, q.title as quiz_title 
       FROM attempts a 
       JOIN quizzes q ON a.quiz_id = q.id 
       WHERE a.user_id = $1 
       ORDER BY a.completed_at DESC 
       LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.get('/api/attempts/:id', isAuthenticated, async (req, res) => {
  try {
    const { rows: attempts } = await pool.query(
      `SELECT a.*, q.title as quiz_title 
       FROM attempts a 
       JOIN quizzes q ON a.quiz_id = q.id 
       WHERE a.id = $1 AND a.user_id = $2`,
      [req.params.id, req.user.id]
    );
    
    if (attempts.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }
    
    const attempt = attempts[0];
    
    const { rows: questions } = await pool.query(
      'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index',
      [attempt.quiz_id]
    );
    
    res.json({
      ...attempt,
      questions: questions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attempt details' });
  }
});

app.get('/api/stats/:quizId', isAuthenticated, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        COUNT(*) as attempt_count,
        AVG(percentage) as avg_score,
        MAX(percentage) as best_score,
        MIN(percentage) as worst_score
       FROM attempts 
       WHERE user_id = $1 AND quiz_id = $2`,
      [req.user.id, req.params.quizId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.delete('/api/quizzes/:id', isAuthenticated, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM quizzes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found or unauthorized' });
    }
    await pool.query('DELETE FROM quizzes WHERE id = $1', [req.params.id]);
    
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

app.post('/api/parse-xml', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check file type
    if (!file.originalname.endsWith('.xml')) {
      return res.status(400).json({ error: 'Only XML files are supported' });
    }

    console.log('📄 Parsing XML file:', file.originalname);

    const quizData = await parseMoodleXML(file.buffer);

    console.log('✅ XML parsed successfully:', {
      title: quizData.title,
      questionsCount: quizData.questions.length
    });

    res.json(quizData);
  } catch (err) {
    console.error('❌ Parse XML error:', err);
    res.status(500).json({ error: 'Failed to parse XML: ' + err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});