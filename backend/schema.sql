CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  preferences JSONB DEFAULT '{"showTopicStats": false}',
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

CREATE TABLE IF NOT EXISTS ai_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_type VARCHAR(50) NOT NULL DEFAULT 'quiz_generation',
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 4),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  plan VARCHAR(50) DEFAULT 'free',
  ai_quota_monthly INTEGER DEFAULT 3,
  ai_quota_used INTEGER DEFAULT 0,
  quota_reset_date DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'),
  subscription_start DATE,
  subscription_end DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL,
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  PRIMARY KEY ("sid")
);

ALTER TABLE quizzes ALTER COLUMN title TYPE VARCHAR(500);
ALTER TABLE quizzes ALTER COLUMN topic TYPE VARCHAR(200);
ALTER TABLE quizzes ALTER COLUMN description TYPE TEXT;

ALTER TABLE questions ALTER COLUMN question_text TYPE TEXT;
ALTER TABLE questions ALTER COLUMN explanation TYPE TEXT;


CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_title ON quizzes USING gin(to_tsvector('english', title));
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_quiz_id ON attempts(quiz_id);
CREATE INDEX idx_attempts_completed_at ON attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_month ON ai_usage(user_id, DATE_TRUNC('month', created_at));
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

CREATE INDEX idx_quizzes_search ON quizzes 
  USING gin(to_tsvector('english', title || ' ' || COALESCE(topic, '') || ' ' || COALESCE(description, '')));

CREATE OR REPLACE FUNCTION can_user_generate_ai_quiz(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  -- Get subscription info (or create if doesn't exist)
  SELECT * INTO subscription_record
  FROM user_subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription, create free tier
  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (user_id, plan, ai_quota_monthly)
    VALUES (p_user_id, 'free', 3)
    RETURNING * INTO subscription_record;
  END IF;
  
  -- Reset quota if new month
  IF subscription_record.quota_reset_date <= CURRENT_DATE THEN
    UPDATE user_subscriptions
    SET ai_quota_used = 0,
        quota_reset_date = DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id
    RETURNING * INTO subscription_record;
  END IF;
  
  -- Check if under quota
  IF subscription_record.ai_quota_used < subscription_record.ai_quota_monthly THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Increment quota used
  UPDATE user_subscriptions
  SET ai_quota_used = ai_quota_used + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id;
  
  -- If no subscription exists, create it
  IF NOT FOUND THEN
    INSERT INTO user_subscriptions (user_id, plan, ai_quota_monthly, ai_quota_used)
    VALUES (p_user_id, 'free', 3, 1);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Seed default subscription for existing users
INSERT INTO user_subscriptions (user_id, plan, ai_quota_monthly, ai_quota_used)
SELECT id, 'free', 3, 0
FROM users
WHERE id NOT IN (SELECT user_id FROM user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE users IS 'User accounts authenticated via Google OAuth';
COMMENT ON TABLE quizzes IS 'Quiz metadata and settings';
COMMENT ON TABLE questions IS 'Individual questions with flexible type system';
COMMENT ON TABLE attempts IS 'User quiz completion records with detailed answers';
COMMENT ON TABLE ai_usage IS 'Tracks AI API usage for billing and analytics';
COMMENT ON TABLE user_subscriptions IS 'User subscription plans and AI quotas (3/month free)';
COMMENT ON FUNCTION can_user_generate_ai_quiz IS 'Checks if user has remaining AI quota for the month';
COMMENT ON FUNCTION increment_ai_usage IS 'Increments user AI usage counter';

COMMENT ON COLUMN questions.question_type IS 'Question type: single_choice, multiple_choice, true_false, numeric, matching';
COMMENT ON COLUMN questions.question_data IS 'Type-specific data stored as JSONB for flexibility';
COMMENT ON COLUMN quizzes.time_limit IS 'Time limit in minutes, NULL means unlimited';
COMMENT ON COLUMN attempts.answers IS 'User answers stored as JSONB, format varies by question type';
