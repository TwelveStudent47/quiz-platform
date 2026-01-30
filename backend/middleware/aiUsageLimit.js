const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

/**
 * Check if user can generate AI quiz (3/month for free tier)
 */
async function checkAIQuota(req, res, next) {
  try {
    const userId = req.user.id;

    // Check if user can generate
    const { rows } = await pool.query(
      'SELECT can_user_generate_ai_quiz($1) as can_generate',
      [userId]
    );

    if (!rows[0].can_generate) {
      // Get quota info for error message
      const { rows: quotaRows } = await pool.query(
        `SELECT ai_quota_monthly, ai_quota_used, quota_reset_date, plan
         FROM user_subscriptions
         WHERE user_id = $1`,
        [userId]
      );

      const quota = quotaRows[0];
      const resetDate = new Date(quota.quota_reset_date).toLocaleDateString('hu-HU');

      return res.status(429).json({
        error: 'AI Quota Exceeded',
        message: `Elérted a havi ${quota.ai_quota_monthly} ingyenes AI teszt limitet.`,
        details: {
          plan: quota.plan,
          used: quota.ai_quota_used,
          limit: quota.ai_quota_monthly,
          resetDate: resetDate
        }
      });
    }

    // User can generate - continue
    next();

  } catch (err) {
    console.error('❌ AI Quota Check Error:', err);
    res.status(500).json({ 
      error: 'Failed to check AI quota',
      message: 'Hiba történt a limit ellenőrzése során'
    });
  }
}

/**
 * Log AI usage after successful generation
 */
async function logAIUsage(userId, metadata = {}) {
  try {
    // Increment quota
    await pool.query('SELECT increment_ai_usage($1)', [userId]);

    // Log detailed usage
    await pool.query(
      `INSERT INTO ai_usage (user_id, usage_type, tokens_used, cost_usd, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        'quiz_generation',
        metadata.tokensUsed || null,
        metadata.costUsd || null,
        JSON.stringify(metadata)
      ]
    );

    console.log(`✅ AI usage logged for user ${userId}`);
  } catch (err) {
    console.error('❌ Failed to log AI usage:', err);
  }
}

/**
 * Get user's AI usage stats
 */
async function getAIUsageStats(userId) {
  try {
    const { rows } = await pool.query(
      `SELECT 
        s.plan,
        s.ai_quota_monthly as quota_limit,
        s.ai_quota_used as quota_used,
        s.quota_reset_date as reset_date,
        (s.ai_quota_monthly - s.ai_quota_used) as remaining,
        COUNT(u.id) as total_generations,
        COALESCE(SUM(u.tokens_used), 0) as total_tokens,
        COALESCE(SUM(u.cost_usd), 0) as total_cost
       FROM user_subscriptions s
       LEFT JOIN ai_usage u ON u.user_id = s.user_id 
         AND u.created_at >= DATE_TRUNC('month', CURRENT_DATE)
       WHERE s.user_id = $1
       GROUP BY s.plan, s.ai_quota_monthly, s.ai_quota_used, s.quota_reset_date`,
      [userId]
    );

    if (rows.length === 0) {
      // No subscription yet - return defaults
      return {
        plan: 'free',
        quota_limit: 3,
        quota_used: 0,
        remaining: 3,
        reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        total_generations: 0,
        total_tokens: 0,
        total_cost: 0
      };
    }

    return rows[0];
  } catch (err) {
    console.error('❌ Failed to get AI usage stats:', err);
    throw err;
  }
}

module.exports = {
  checkAIQuota,
  logAIUsage,
  getAIUsageStats
};