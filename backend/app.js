// server.js - Quiz Platform Backend
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

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth Strategy
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

// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Not authenticated' });
};

// Routes

// Auth
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

// File parser utility
async function parseQuizFile(buffer, fileType) {
  if (fileType === 'json') {
    return JSON.parse(buffer.toString());
  } else if (fileType === 'xml') {
    return new Promise((resolve, reject) => {
      xml2js.parseString(buffer.toString(), (err, result) => {
        if (err) {
          reject(err);
        } else {
          // Convert XML structure to our JSON format
          const quiz = result.quiz;
          const formatted = {
            title: quiz.title[0],
            topic: quiz.topic ? quiz.topic[0] : '',
            description: quiz.description ? quiz.description[0] : '',
            questions: quiz.questions[0].question.map(q => ({
              text: q.text[0],
              options: q.options[0].option,
              correctIndex: parseInt(q.correctIndex[0]),
              explanation: q.explanation ? q.explanation[0] : null
            }))
          };
          resolve(formatted);
        }
      });
    });
  }
  throw new Error('Unsupported file type');
}

// Upload quiz
app.post('/api/upload', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const fileType = file.originalname.endsWith('.json') ? 'json' : 'xml';
    
    const quizData = await parseQuizFile(file.buffer, fileType);
    
    // Insert quiz
    const quizResult = await pool.query(
      'INSERT INTO quizzes (user_id, title, description, topic) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.user.id, quizData.title, quizData.description || '', quizData.topic || '']
    );
    
    const quizId = quizResult.rows[0].id;
    
    // Insert questions
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      await pool.query(
        'INSERT INTO questions (quiz_id, question_text, options, correct_index, explanation, order_index) VALUES ($1, $2, $3, $4, $5, $6)',
        [quizId, q.text, JSON.stringify(q.options), q.correctIndex, q.explanation || null, i]
      );
    }
    
    res.json({ success: true, quizId });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to parse or save quiz' });
  }
});

// Get all quizzes (with search)
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

// Get single quiz with questions
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

// Submit quiz attempt
app.post('/api/submit', isAuthenticated, async (req, res) => {
  try {
    const { quizId, answers, timeSpent } = req.body;
    
    // Get correct answers
    const { rows: questions } = await pool.query(
      'SELECT id, correct_index FROM questions WHERE quiz_id = $1',
      [quizId]
    );
    
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_index) score++;
    });
    
    // Save attempt
    const result = await pool.query(
      'INSERT INTO attempts (user_id, quiz_id, score, total_questions, answers, time_spent) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, quizId, score, questions.length, JSON.stringify(answers), timeSpent]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit attempt' });
  }
});

// Get attempt history
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

// Get quiz statistics
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});