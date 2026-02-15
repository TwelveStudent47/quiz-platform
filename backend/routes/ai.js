// backend/routes/ai.js
const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();
const { checkAIQuota, logAIUsage, getAIUsageStats } = require('../middleware/aiUsageLimit');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Not authenticated' });
};

// Question type labels for Hungarian UI
const TYPE_LABELS = {
  'single_choice': 'Egy válaszos',
  'multiple_choice': 'Több válaszos',
  'true_false': 'Igaz/Hamis',
  'numeric': 'Számos',
  'matching': 'Illesztéses',
  'cloze': 'Kitöltendő',
  'essay': 'Esszé'
};

// Generate quiz with Claude AI
router.post('/generate-quiz', isAuthenticated, checkAIQuota, async (req, res) => {
  try {
    const { topic, documentation, questionCount, difficulty, questionTypes } = req.body;

    if (!topic || !questionCount || !questionTypes || questionTypes.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🤖 AI Quiz Generation requested:', {
      topic,
      questionCount,
      difficulty,
      types: questionTypes
    });

    // Build prompt
    const prompt = buildGenerationPrompt(topic, documentation, questionCount, difficulty, questionTypes);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      temperature: 0.8,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Parse response
    const responseText = message.content[0].text;
    console.log('📝 AI Response length:', responseText.length);

    const quizData = parseAIResponse(responseText);

    await logAIUsage(req.user.id, {
      topic,
      questionCount,
      difficulty,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      costUsd: calculateCost(message.usage),
      questionsGenerated: quizData.questions.length
    });

    console.log('✅ AI Generation successful:', quizData.questions.length, 'questions generated');

    res.json({
      title: quizData.title || `${topic} - Teszt`,
      topic: topic,
      description: quizData.description || `AI-generált teszt: ${topic}`,
      timeLimit: calculateTimeLimit(quizData.questions.length),
      questions: quizData.questions
    });

  } catch (err) {
    console.error('❌ AI Generation error:', err);
    res.status(500).json({
      error: 'AI generation failed',
      details: err.message
    });
  }
});

router.get('/usage', isAuthenticated, async (req, res) => {
  try {
    const stats = await getAIUsageStats(req.user.id);
    res.json(stats);
  } catch (err) {
    console.error('❌ Failed to get AI usage:', err);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

// Build comprehensive generation prompt for all question types
function buildGenerationPrompt(topic, documentation, questionCount, difficulty, questionTypes) {
  let prompt = `You are an expert educational quiz creator. Generate a comprehensive ${difficulty} difficulty quiz about "${topic}" with exactly ${questionCount} questions.

`;

  if (documentation) {
    prompt += `BASE YOUR QUESTIONS ON THIS DOCUMENTATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${documentation.substring(0, 12000)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
  }

  prompt += `ALLOWED QUESTION TYPES: ${questionTypes.map(t => TYPE_LABELS[t] || t).join(', ')}

DIFFICULTY GUIDELINES:
• EASY: Basic recall, definitions, simple concepts
• MEDIUM: Application, analysis, connections between concepts
• HARD: Complex reasoning, synthesis, edge cases, critical thinking

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE FORMAT (PURE JSON WRAPPER, MARKDOWN INSIDE TEXT FIELDS):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "title": "Quiz title in Hungarian",
  "description": "Brief description in Hungarian",
  "questions": [

    // SINGLE CHOICE (Egy válaszos)
    {
      "type": "single_choice",
      "text": "Clear question text (use **Markdown** for formatting)",
      "data": {
        "options": [
          "First option",
          "Second option", 
          "Third option",
          "Fourth option"
        ],
        "correctIndex": 0
      },
      "points": 1,
      "explanation": "Why option A is correct and others are wrong (use **Markdown** for formatting)"
    },

    // MULTIPLE CHOICE (Több válaszos)
    {
      "type": "multiple_choice",
      "text": "Select ALL correct answers",
      "data": {
        "options": [
          "First correct option",
          "Wrong option",
          "Second correct option",
          "Another wrong option"
        ],
        "correctIndices": [0, 2]
      },
      "points": 2,
      "explanation": "Explanation of all correct answers"
    },

    // TRUE/FALSE (Igaz/Hamis)
    {
      "type": "true_false",
      "text": "Statement to evaluate as true or false",
      "data": {
        "correctAnswer": true
      },
      "points": 1,
      "explanation": "Why this statement is true/false"
    },

    // NUMERIC (Számos)
    {
      "type": "numeric",
      "text": "Calculate or provide a numeric answer",
      "data": {
        "correctAnswer": 42.5,
        "unit": "kg"
      },
      "points": 2,
      "explanation": "Step-by-step calculation explanation"
    },

    // MATCHING (Illesztéses)
    {
      "type": "matching",
      "text": "Match the items from left column to right column",
      "data": {
        "pairs": [
          {"left": "Term 1", "right": "Definition 1"},
          {"left": "Term 2", "right": "Definition 2"},
          {"left": "Term 3", "right": "Definition 3"},
          {"left": "Term 4", "right": "Definition 4"}
        ],
        "correctPairs": {
          "0": 0,
          "1": 1,
          "2": 2,
          "3": 3
        }
      },
      "points": 3,
      "explanation": "Explanation of each correct match"
    },

    // CLOZE (Kitöltendő)
    {
      "type": "cloze",
      "text": "The {0} is the largest planet, and it has {1} moons.",
      "data": {
        "text": "The {0} is the largest planet, and it has {1} moons.",
        "blanks": [
          {
            "type": "dropdown",
            "options": ["Jupiter", "Mars", "Saturn", "Earth"],
            "correctIndex": 0
          },
          {
            "type": "text",
            "correctAnswer": "79",
            "caseSensitive": false
          }
        ]
      },
      "points": 2,
      "explanation": "Explanation for each blank"
    },

    // ESSAY (Esszé)
    {
      "type": "essay",
      "text": "Explain in detail... (requires manual grading)",
      "data": {
        "responseFormat": "editor",
        "responseRequired": true,
        "responseFieldLines": 15,
        "minWordLimit": 100,
        "maxWordLimit": 500
      },
      "points": 5,
      "explanation": "Grading rubric and key points to look for"
    }
  ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. OUTPUT PURE JSON ONLY - no markdown code fences around the JSON, no explanatory text outside JSON
2. Use ONLY the allowed question types: ${questionTypes.join(', ')}
3. Distribute question types evenly if multiple types selected
4. ALL questions must be in HUNGARIAN language
5. Ensure factual accuracy - no made-up information
6. Each question must have a clear, educational explanation
7. Options must be plausible - avoid obvious wrong answers
8. USE MARKDOWN FORMATTING inside "text" and "explanation" fields:
   - Use **félkövér** for key terms and important concepts
   - Use *dőlt* for emphasis
   - Use \`kód\` for code snippets, technical terms, or formulas
   - Use lists (- item) when listing multiple items or steps
   - Use > blockquotes for definitions or important notes
   - This makes questions visually richer and more educational
   - Do NOT use Markdown in option strings (keep those plain text)
9. For cloze questions:
   - Use {0}, {1}, {2}... as placeholders
   - Mix dropdown and text blanks
   - Dropdown options should be plausible
10. For matching questions:
    - Minimum 3 pairs, maximum 6 pairs
    - Shuffle the right column order (correctPairs shows matches)
11. For essay questions:
    - Provide clear grading criteria
    - Set appropriate word limits
12. Vary difficulty across questions if count > 5
13. Points:
    - Single choice: 1 point
    - Multiple choice: 2 points
    - True/false: 1 point
    - Numeric: 2 points
    - Matching: 2-3 points
    - Cloze: 2-3 points
    - Essay: 5-10 points

Generate exactly ${questionCount} questions now using the allowed types.`;

  return prompt;
}

// Parse AI response with comprehensive validation
function parseAIResponse(responseText) {
  try {
    // Clean response - remove any markdown artifacts
    let cleanJson = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*/, '') // Remove anything before first {
      .replace(/[^}]*$/, '') // Remove anything after last }
      .trim();

    // Parse JSON
    const data = JSON.parse(cleanJson);

    // Validate structure
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid response structure - missing questions array');
    }

    console.log(`📊 Parsed ${data.questions.length} questions from AI`);

    // Validate and sanitize each question
    data.questions = data.questions.map((q, idx) => {
      try {
        return validateQuestion(q, idx);
      } catch (err) {
        console.warn(`⚠️ Question ${idx} validation failed:`, err.message);
        return null;
      }
    }).filter(q => q !== null);

    if (data.questions.length === 0) {
      throw new Error('No valid questions generated');
    }

    console.log(`✅ ${data.questions.length} valid questions after validation`);

    return data;

  } catch (err) {
    console.error('❌ Failed to parse AI response:', err);
    console.error('Response preview:', responseText.substring(0, 500));
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

// Validate individual question based on type
function validateQuestion(q, idx) {
  // Basic validation
  if (!q.type || !q.text) {
    throw new Error(`Missing type or text`);
  }

  if (!q.data || typeof q.data !== 'object') {
    throw new Error(`Missing or invalid data object`);
  }

  // Set default points if missing
  if (!q.points) {
    q.points = getDefaultPoints(q.type);
  }

  // Type-specific validation
  switch (q.type) {
    case 'single_choice':
      return validateSingleChoice(q);

    case 'multiple_choice':
      return validateMultipleChoice(q);

    case 'true_false':
      return validateTrueFalse(q);

    case 'numeric':
      return validateNumeric(q);

    case 'matching':
      return validateMatching(q);

    case 'cloze':
      return validateCloze(q);

    case 'essay':
      return validateEssay(q);

    default:
      throw new Error(`Unknown question type: ${q.type}`);
  }
}

// Type-specific validators
function validateSingleChoice(q) {
  if (!Array.isArray(q.data.options) || q.data.options.length < 2) {
    throw new Error('Single choice needs at least 2 options');
  }

  if (typeof q.data.correctIndex !== 'number' ||
    q.data.correctIndex < 0 ||
    q.data.correctIndex >= q.data.options.length) {
    throw new Error('Invalid correctIndex');
  }

  return q;
}

function validateMultipleChoice(q) {
  if (!Array.isArray(q.data.options) || q.data.options.length < 2) {
    throw new Error('Multiple choice needs at least 2 options');
  }

  if (!Array.isArray(q.data.correctIndices) || q.data.correctIndices.length === 0) {
    throw new Error('Multiple choice needs at least 1 correct answer');
  }

  // Validate all indices are within range
  for (const idx of q.data.correctIndices) {
    if (idx < 0 || idx >= q.data.options.length) {
      throw new Error(`Invalid correctIndex: ${idx}`);
    }
  }

  return q;
}

function validateTrueFalse(q) {
  if (typeof q.data.correctAnswer !== 'boolean') {
    throw new Error('True/False needs boolean correctAnswer');
  }
  return q;
}

function validateNumeric(q) {
  if (typeof q.data.correctAnswer !== 'number') {
    // Try to parse if string
    q.data.correctAnswer = parseFloat(q.data.correctAnswer);
    if (isNaN(q.data.correctAnswer)) {
      throw new Error('Numeric needs number correctAnswer');
    }
  }

  // Unit is optional
  if (!q.data.unit) {
    q.data.unit = '';
  }

  return q;
}

function validateMatching(q) {
  if (!Array.isArray(q.data.pairs) || q.data.pairs.length < 2) {
    throw new Error('Matching needs at least 2 pairs');
  }

  // Validate each pair
  for (const pair of q.data.pairs) {
    if (!pair.left || !pair.right) {
      throw new Error('Matching pairs need left and right values');
    }
  }

  // Validate correctPairs
  if (!q.data.correctPairs || typeof q.data.correctPairs !== 'object') {
    // Auto-generate if missing (assume correct order)
    q.data.correctPairs = {};
    q.data.pairs.forEach((_, idx) => {
      q.data.correctPairs[idx] = idx;
    });
  }

  return q;
}

function validateCloze(q) {
  if (!q.data.text) {
    throw new Error('Cloze needs text with placeholders');
  }

  if (!Array.isArray(q.data.blanks) || q.data.blanks.length === 0) {
    throw new Error('Cloze needs at least 1 blank');
  }

  // Validate each blank
  for (const blank of q.data.blanks) {
    if (blank.type === 'dropdown') {
      if (!Array.isArray(blank.options) || blank.options.length < 2) {
        throw new Error('Dropdown blank needs at least 2 options');
      }
      if (typeof blank.correctIndex !== 'number') {
        throw new Error('Dropdown blank needs correctIndex');
      }
    } else if (blank.type === 'text') {
      if (!blank.correctAnswer) {
        throw new Error('Text blank needs correctAnswer');
      }
      if (blank.caseSensitive === undefined) {
        blank.caseSensitive = false;
      }
    } else {
      throw new Error(`Unknown blank type: ${blank.type}`);
    }
  }

  // Ensure text field matches data.text
  q.text = q.data.text;

  return q;
}

function validateEssay(q) {
  // Set defaults if missing
  if (!q.data.responseFormat) {
    q.data.responseFormat = 'editor';
  }

  if (q.data.responseRequired === undefined) {
    q.data.responseRequired = true;
  }

  if (!q.data.responseFieldLines) {
    q.data.responseFieldLines = 15;
  }

  if (!q.data.minWordLimit) {
    q.data.minWordLimit = null;
  }

  if (!q.data.maxWordLimit) {
    q.data.maxWordLimit = null;
  }

  return q;
}

// Get default points for question type
function getDefaultPoints(type) {
  const points = {
    'single_choice': 1,
    'multiple_choice': 2,
    'true_false': 1,
    'numeric': 2,
    'matching': 3,
    'cloze': 2,
    'essay': 5
  };
  return points[type] || 1;
}

// Calculate time limit based on question count and types
function calculateTimeLimit(questionCount) {
  // Average 1.5 minutes per question
  return Math.ceil(questionCount * 1.5);
}

function calculateCost(usage) {
  const inputCost = (usage.input_tokens / 1000000) * 3;
  const outputCost = (usage.output_tokens / 1000000) * 15;
  return inputCost + outputCost;
}

module.exports = router;