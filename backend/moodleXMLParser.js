const xml2js = require('xml2js');

/**
 * Strip HTML tags from text, extract image sources
 * @param {string} html - HTML string
 * @returns {object} - { text, imageUrl }
 */

function parseClozeQuestion(questionText) {
  const blanks = [];
  let plainText = questionText;

  const clozeRegex = /\{(\d+):(MULTICHOICE|SHORTANSWER|NUMERICAL):([^}]+)\}/g;
  let match;
  let index = 0;
  
  while ((match = clozeRegex.exec(questionText)) !== null) {
    const [fullMatch, blankNum, type, content] = match;

    plainText = plainText.replace(fullMatch, `{${index}}`);
    
    if (type === 'MULTICHOICE') {
      const options = [];
      let correctIndex = 0;
      
      const optionParts = content.split('~').filter(p => p.trim());
      optionParts.forEach((part, idx) => {
        const isCorrect = part.startsWith('=');
        const text = part.replace(/^=/, '').split('#')[0].trim();
        
        if (text) {
          options.push(text);
          if (isCorrect) {
            correctIndex = options.length - 1;
          }
        }
      });
      
      blanks.push({
        type: 'dropdown',
        options: options.length > 0 ? options : ['', '', ''],
        correctIndex: correctIndex
      });
    } else if (type === 'SHORTANSWER') {
      const answer = content.replace(/^=/, '').split('#')[0].trim();
      
      blanks.push({
        type: 'text',
        correctAnswer: answer,
        caseSensitive: false
      });
    } else if (type === 'NUMERICAL') {
      const parts = content.replace(/^=/, '').split(':');
      const answer = parts[0].trim();
      
      blanks.push({
        type: 'text',
        correctAnswer: answer,
        caseSensitive: false
      });
    }
    
    index++;
  }
  
  return {
    text: plainText,
    blanks: blanks
  };
}

function stripHTMLAndExtractImage(html) {
  if (!html) return { text: '', imageUrl: null };

  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const imgMatch = html.match(imgRegex);
  const imageUrl = imgMatch ? imgMatch[1] : null;

  let text = html.replace(/<[^>]*>/g, '');

  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  text = text.trim();

  return { text, imageUrl };
}

/**
 * Parse Moodle XML to quiz format compatible with CreateQuizView
 * @param {Buffer} xmlBuffer - XML file buffer
 * @returns {Promise<Object>} - Parsed quiz data
 */
async function parseMoodleXML(xmlBuffer) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();
    
    parser.parseString(xmlBuffer.toString(), (err, result) => {
      if (err) {
        return reject(new Error('Failed to parse XML'));
      }

      try {
        const quiz = result.quiz || {};
        const questions = [];

        if (quiz.question && Array.isArray(quiz.question)) {
          for (const q of quiz.question) {
            const questionType = q.$.type;

            if (questionType === 'category') {
              console.log(`Skipping ${questionType} question`);
              continue;
            }

            const questionHTML = q.questiontext?.[0]?.text?.[0] || '';
            const { text: questionText, imageUrl } = stripHTMLAndExtractImage(questionHTML);

            const generalFeedbackHTML = q.generalfeedback?.[0]?.text?.[0] || '';
            const { text: generalFeedback } = stripHTMLAndExtractImage(generalFeedbackHTML);
            
            const defaultGrade = parseFloat(q.defaultgrade?.[0] || '1');

            let parsedQuestion = null;

            switch (questionType) {
              case 'multichoice': {
                const single = q.single?.[0] === 'true';
                const answers = q.answer || [];
                
                const options = answers.map(a => {
                  const answerHTML = a.text?.[0] || '';
                  const { text } = stripHTMLAndExtractImage(answerHTML);
                  return text;
                });
                
                if (single) {
                  const correctIndex = answers.findIndex(a => 
                    parseFloat(a.$.fraction || '0') > 0
                  );
                  
                  parsedQuestion = {
                    type: 'single_choice',
                    text: questionText,
                    image: imageUrl,
                    data: {
                      options,
                      correctIndex: correctIndex >= 0 ? correctIndex : 0
                    },
                    points: Math.round(defaultGrade),
                    explanation: generalFeedback
                  };
                } else {
                  const correctIndices = [];
                  answers.forEach((a, idx) => {
                    if (parseFloat(a.$.fraction || '0') > 0) {
                      correctIndices.push(idx);
                    }
                  });
                  
                  parsedQuestion = {
                    type: 'multiple_choice',
                    text: questionText,
                    image: imageUrl,
                    data: {
                      options,
                      correctIndices
                    },
                    points: Math.round(defaultGrade),
                    explanation: generalFeedback
                  };
                }
                break;
              }

              case 'truefalse': {
                const answers = q.answer || [];
                const trueAnswer = answers.find(a => a.text?.[0]?.toLowerCase() === 'true');
                const correctAnswer = trueAnswer && parseFloat(trueAnswer.$.fraction || '0') > 0;
                
                parsedQuestion = {
                  type: 'true_false',
                  text: questionText,
                  image: imageUrl,
                  data: {
                    correctAnswer: correctAnswer
                  },
                  points: Math.round(defaultGrade),
                  explanation: generalFeedback
                };
                break;
              }

              case 'numerical': {
                const answers = q.answer || [];
                const correctAnswer = parseFloat(answers[0]?.text?.[0] || '0');
                const tolerance = parseFloat(answers[0]?.tolerance?.[0] || '0');

                const units = q.units?.[0]?.unit || [];
                const unit = units[0]?.unit_name?.[0] || '';
                
                parsedQuestion = {
                  type: 'numeric',
                  text: questionText,
                  image: imageUrl,
                  data: {
                    correctAnswer,
                    tolerance,
                    unit
                  },
                  points: Math.round(defaultGrade),
                  explanation: generalFeedback
                };
                break;
              }

              case 'matching': {
                const subquestions = q.subquestion || [];
                const pairs = [];
                const correctPairs = {};
                
                subquestions.forEach((sq, idx) => {
                  const leftHTML = sq.text?.[0] || '';
                  const rightHTML = sq.answer?.[0]?.text?.[0] || '';
                  
                  const { text: left } = stripHTMLAndExtractImage(leftHTML);
                  const { text: right } = stripHTMLAndExtractImage(rightHTML);
                  
                  if (left && right) {
                    pairs.push({ left, right });
                    correctPairs[idx] = idx;
                  }
                });
                
                parsedQuestion = {
                  type: 'matching',
                  text: questionText,
                  image: imageUrl,
                  data: {
                    pairs,
                    correctPairs
                  },
                  points: Math.round(defaultGrade),
                  explanation: generalFeedback
                };
                break;
              }

              case 'cloze':
                console.log('📝 Parsing Cloze question');
        
                const clozeData = parseClozeQuestion(questionHTML);
                
                parsedQuestion = {
                  type: 'cloze',
                  text: questionText,
                  image: imageUrl,
                  data: clozeData,
                  points: Math.round(defaultGrade),
                  explanation: generalFeedback
                };
                
                console.log(`  ✅ Cloze parsed: ${clozeData.blanks.length} blanks`);
                break;
              case 'shortanswer':
              case 'essay': {
                const responseFormat = q.responseformat?.[0] || 'editor';
                const responseRequired = q.responserequired?.[0] === '1';
                const responseFieldLines = parseInt(q.responsefieldlines?.[0] || '15');
                const minWordLimit = parseInt(q.minwordlimit?.[0] || '0') || null;
                const maxWordLimit = parseInt(q.maxwordlimit?.[0] || '0') || null;
                const attachments = parseInt(q.attachments?.[0] || '0');
                const maxBytes = parseInt(q.maxbytes?.[0] || '0');
                
                parsedQuestion = {
                  type: 'essay',
                  text: questionText,
                  image: imageUrl,
                  data: {
                    responseFormat,
                    responseRequired,
                    responseFieldLines,
                    minWordLimit,
                    maxWordLimit,
                    attachmentsAllowed: attachments,
                    maxBytes
                  },
                  points: Math.round(defaultGrade),
                  explanation: generalFeedback
                };
                break;
              }
              case 'description':
                console.log(`Skipping unsupported question type: ${questionType}`);
                break;

              default:
                console.log(`Unknown question type: ${questionType}`);
            }

            if (parsedQuestion) {
              questions.push(parsedQuestion);
            }
          }
        }

        const categoryQuestion = quiz.question?.find(q => q.$.type === 'category');
        const categoryText = categoryQuestion?.category?.[0]?.text?.[0] || '';
        const categoryParts = categoryText.split('/');
        const topic = categoryParts[categoryParts.length - 1] || '';

        const title = quiz.$?.title || 'Imported Quiz';
        const description = quiz.$?.intro || '';

        const quizData = {
          title,
          topic,
          description,
          timeLimit: null,
          questions
        };

        console.log(`✅ Parsed: ${questions.length} questions`);
        questions.forEach((q, idx) => {
          console.log(`  ${idx + 1}. ${q.type}: "${q.text.substring(0, 50)}..." ${q.image ? '(has image)' : ''}`);
        });

        resolve(quizData);
      } catch (error) {
        console.error('Parse error:', error);
        reject(new Error('Failed to process XML structure: ' + error.message));
      }
    });
  });
}

module.exports = { parseMoodleXML };