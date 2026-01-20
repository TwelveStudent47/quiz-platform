const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const multer = require('multer');
const { Pool } = require('pg');
const xml2js = require('xml2js');
const cors = require('cors');
require('dotenv').config()

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
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

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
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
        case 'matching':
          if (userAnswer && typeof userAnswer === 'object') {
            isCorrect = JSON.stringify(userAnswer) === JSON.stringify(data.correctPairs);
          }
          break;
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});