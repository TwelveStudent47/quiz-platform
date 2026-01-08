CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quizzes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  topic VARCHAR(100),
  time_limit INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question_type VARCHAR(20) NOT NULL DEFAULT 'single_choice',
  question_text TEXT NOT NULL,
  question_image TEXT,
  question_data JSONB NOT NULL,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_points > 0 THEN (score::DECIMAL / total_points * 100)
      ELSE 0 
    END
  ) STORED,
  answers JSONB NOT NULL,
  time_spent INTEGER,
  completed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_title ON quizzes USING gin(to_tsvector('english', title));
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_quiz_id ON attempts(quiz_id);
CREATE INDEX idx_attempts_completed_at ON attempts(completed_at DESC);

CREATE INDEX idx_quizzes_search ON quizzes 
  USING gin(to_tsvector('english', title || ' ' || COALESCE(topic, '') || ' ' || COALESCE(description, '')));

COMMENT ON TABLE users IS 'User accounts authenticated via Google OAuth';
COMMENT ON TABLE quizzes IS 'Quiz metadata and settings';
COMMENT ON TABLE questions IS 'Individual questions with flexible type system';
COMMENT ON TABLE attempts IS 'User quiz completion records with detailed answers';

COMMENT ON COLUMN questions.question_type IS 'Question type: single_choice, multiple_choice, true_false, numeric, matching';
COMMENT ON COLUMN questions.question_data IS 'Type-specific data stored as JSONB for flexibility';
COMMENT ON COLUMN quizzes.time_limit IS 'Time limit in minutes, NULL means unlimited';
COMMENT ON COLUMN attempts.answers IS 'User answers stored as JSONB, format varies by question type';