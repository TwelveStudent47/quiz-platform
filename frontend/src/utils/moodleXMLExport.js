// utils/moodleXMLExport.js - WITH MARKDOWN → HTML SUPPORT

import { markdownToHtml } from './markdownToHtml';

export function exportToMoodleXML(quizData) {
  const { title, topic, questions } = quizData;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';

  // Category
  xml += '  <question type="category">\n';
  xml += '    <category>\n';
  xml += `      <text>$course$/${escapeXML(topic || 'General')}</text>\n`;
  xml += '    </category>\n';
  xml += '  </question>\n\n';

  // Questions
  questions.forEach((q, idx) => {
    xml += `  <!-- Question ${idx + 1}: ${escapeXML(q.text).substring(0, 50)}... -->\n`;

    switch (q.type) {
      case 'single_choice':
        xml += generateSingleChoice(q);
        break;
      case 'multiple_choice':
        xml += generateMultipleChoice(q);
        break;
      case 'true_false':
        xml += generateTrueFalse(q);
        break;
      case 'numeric':
        xml += generateNumeric(q);
        break;
      case 'matching':
        xml += generateMatching(q);
        break;
      case 'cloze':
        xml += generateCloze(q);
        break;
      case 'essay':
        xml += generateEssay(q);
        break;
      default:
        console.warn(`Unknown question type: ${q.type}`);
    }

    xml += '\n';
  });

  xml += '</quiz>';
  return xml;
}

function generateSingleChoice(q) {
  let xml = '  <question type="multichoice">\n';
  xml += '    <name>\n';
  xml += `      <text>${escapeXML(q.text).substring(0, 255)}</text>\n`;
  xml += '    </name>\n';
  xml += '    <questiontext format="html">\n';
  xml += `      <text><![CDATA[${markdownToHtml(q.text)}]]></text>\n`;
  xml += '    </questiontext>\n';
  xml += `    <defaultgrade>${q.points || 1}</defaultgrade>\n`;
  xml += '    <penalty>0.1</penalty>\n';
  xml += '    <single>true</single>\n';
  xml += '    <shuffleanswers>true</shuffleanswers>\n';
  xml += '    <answernumbering>abc</answernumbering>\n';

  q.data.options.forEach((option, idx) => {
    const fraction = idx === q.data.correctIndex ? '100' : '0';
    xml += `    <answer fraction="${fraction}" format="html">\n`;
    xml += `      <text><![CDATA[${markdownToHtml(option)}]]></text>\n`;
    if (idx === q.data.correctIndex && q.explanation) {
      xml += '      <feedback format="html">\n';
      xml += `        <text><![CDATA[${markdownToHtml(q.explanation)}]]></text>\n`;
      xml += '      </feedback>\n';
    }
    xml += '    </answer>\n';
  });

  if (q.explanation) {
    xml += '    <generalfeedback format="html">\n';
    xml += `      <text><![CDATA[${markdownToHtml(q.explanation)}]]></text>\n`;
    xml += '    </generalfeedback>\n';
  }

  xml += '  </question>\n';
  return xml;
}

function generateMultipleChoice(q) {
  let xml = '  <question type="multichoice">\n';
  xml += '    <name>\n';
  xml += `      <text>${escapeXML(q.text).substring(0, 255)}</text>\n`;
  xml += '    </name>\n';
  xml += '    <questiontext format="html">\n';
  xml += `      <text><![CDATA[${markdownToHtml(q.text)}]]></text>\n`;
  xml += '    </questiontext>\n';
  xml += `    <defaultgrade>${q.points || 2}</defaultgrade>\n`;
  xml += '    <penalty>0.1</penalty>\n';
  xml += '    <single>false</single>\n';
  xml += '    <shuffleanswers>true</shuffleanswers>\n';
  xml += '    <answernumbering>abc</answernumbering>\n';

  const correctCount = q.data.correctIndices.length;
  const fractionPerCorrect = 100 / correctCount;

  q.data.options.forEach((option, idx) => {
    const isCorrect = q.data.correctIndices.includes(idx);
    const fraction = isCorrect ? fractionPerCorrect.toFixed(5) : '0';
    xml += `    <answer fraction="${fraction}" format="html">\n`;
    xml += `      <text><![CDATA[${markdownToHtml(option)}]]></text>\n`;
    xml += '    </answer>\n';
  });

  if (q.explanation) {
    xml += '    <generalfeedback format="html">\n';
    xml += `      <text><![CDATA[${markdownToHtml(q.explanation)}]]></text>\n`;
    xml += '    </generalfeedback>\n';
  }

  xml += '  </question>\n';
  return xml;
}

function generateTrueFalse(q) {
  let xml = '  <question type="truefalse">\n';
  xml += '    <name>\n';
  xml += `      <text>${escapeXML(q.text).substring(0, 255)}</text>\n`;
  xml += '    </name>\n';
  xml += '    <questiontext format="html">\n';
  xml += `      <text><![CDATA[${markdownToHtml(q.text)}]]></text>\n`;
  xml += '    </questiontext>\n';
  xml += `    <defaultgrade>${q.points || 1}</defaultgrade>\n`;
  xml += `    <answer fraction="${q.data.correctAnswer ? '100' : '0'}" format="moodle_auto_format">\n`;
  xml += `      <text>${q.data.correctAnswer ? 'true' : 'false'}</text>\n`;
  xml += '    </answer>\n';
  xml += `    <answer fraction="${q.data.correctAnswer ? '0' : '100'}" format="moodle_auto_format">\n`;
  xml += `      <text>${q.data.correctAnswer ? 'false' : 'true'}</text>\n`;
  xml += '    </answer>\n';

  if (q.explanation) {
    xml += '    <generalfeedback format="html">\n';
    xml += `      <text><![CDATA[${markdownToHtml(q.explanation)}]]></text>\n`;
    xml += '    </generalfeedback>\n';
  }

  xml += '  </question>\n';
  return xml;
}

function generateNumeric(q) {
  let xml = '  <question type="numerical">\n';
  xml += '    <name>\n';
  xml += `      <text>${escapeXML(q.text).substring(0, 255)}</text>\n`;
  xml += '    </name>\n';
  xml += '    <questiontext format="html">\n';
  xml += `      <text><![CDATA[${markdownToHtml(q.text)}]]></text>\n`;
  xml += '    </questiontext>\n';
  xml += `    <defaultgrade>${q.points || 2}</defaultgrade>\n`;
  xml += '    <answer fraction="100" format="moodle_auto_format">\n';
  xml += `      <text>${q.data.correctAnswer}</text>\n`;
  xml += '      <tolerance>0.01</tolerance>\n';
  xml += '    </answer>\n';

  if (q.data.unit) {
    xml += '    <units>\n';
    xml += '      <unit>\n';
    xml += `        <multiplier>1</multiplier>\n`;
    xml += `        <unit_name>${escapeXML(q.data.unit)}</unit_name>\n`;
    xml += '      </unit>\n';
    xml += '    </units>\n';
  }

  if (q.explanation) {
    xml += '    <generalfeedback format="html">\n';
    xml += `      <text><![CDATA[${markdownToHtml(q.explanation)}]]></text>\n`;
    xml += '    </generalfeedback>\n';
  }

  xml += '  </question>\n';
  return xml;
}

function generateMatching(q) {
  let xml = '  <question type="matching">\n';
  xml += '    <name>\n';
  xml += `      <text>${escapeXML(q.text).substring(0, 255)}</text>\n`;
  xml += '    </name>\n';
  xml += '    <questiontext format="html">\n';
  xml += `      <text><![CDATA[${markdownToHtml(q.text)}]]></text>\n`;
  xml += '    </questiontext>\n';
  xml += `    <defaultgrade>${q.points || 3}</defaultgrade>\n`;
  xml += '    <shuffleanswers>true</shuffleanswers>\n';

  q.data.pairs.forEach((pair) => {
    xml += '    <subquestion format="html">\n';
    xml += `      <text><![CDATA[${markdownToHtml(pair.left)}]]></text>\n`;
    xml += `      <answer><text>${escapeXML(pair.right)}</text></answer>\n`;
    xml += '    </subquestion>\n';
  });

  if (q.explanation) {
    xml += '    <generalfeedback format="html">\n';
    xml += `      <text><![CDATA[${markdownToHtml(q.explanation)}]]></text>\n`;
    xml += '    </generalfeedback>\n';
  }

  xml += '  </question>\n';
  return xml;
}

function generateCloze(q) {
  let xml = '  <question type="cloze">\n';
  xml += '    <name>\n';
  xml += `      <text>${escapeXML(q.text).substring(0, 255)}</text>\n`;
  xml += '    </name>\n';

  // Build cloze text with embedded answers
  let clozeText = q.data.text;
  q.data.blanks.forEach((blank, idx) => {
    let replacement = '';

    if (blank.type === 'dropdown') {
      replacement = `{1:MULTICHOICE:=${escapeXML(blank.options[blank.correctIndex])}`;
      blank.options.forEach((opt, optIdx) => {
        if (optIdx !== blank.correctIndex) {
          replacement += `~${escapeXML(opt)}`;
        }
      });
      replacement += '}';
    } else if (blank.type === 'text') {
      replacement = `{1:SHORTANSWER:=${escapeXML(blank.correctAnswer)}}`;
    }

    clozeText = clozeText.replace(`{${idx}}`, replacement);
  });

  xml += '    <questiontext format="html">\n';
  xml += `      <text><![CDATA[${clozeText}]]></text>\n`;
  xml += '    </questiontext>\n';
  xml += `    <defaultgrade>${q.points || 2}</defaultgrade>\n`;
  xml += '    <penalty>0.1</penalty>\n';

  if (q.explanation) {
    xml += '    <generalfeedback format="html">\n';
    xml += `      <text><![CDATA[${markdownToHtml(q.explanation)}]]></text>\n`;
    xml += '    </generalfeedback>\n';
  }

  xml += '  </question>\n';
  return xml;
}

function generateEssay(q) {
  let xml = '  <question type="essay">\n';
  xml += '    <name>\n';
  xml += `      <text>${escapeXML(q.text).substring(0, 255)}</text>\n`;
  xml += '    </name>\n';
  xml += '    <questiontext format="html">\n';
  xml += `      <text><![CDATA[${markdownToHtml(q.text)}]]></text>\n`;
  xml += '    </questiontext>\n';
  xml += `    <defaultgrade>${q.points || 5}</defaultgrade>\n`;
  xml += '    <responseformat>editor</responseformat>\n';
  xml += `    <responserequired>${q.data.responseRequired ? '1' : '0'}</responserequired>\n`;
  xml += `    <responsefieldlines>${q.data.responseFieldLines || 15}</responsefieldlines>\n`;

  if (q.explanation) {
    xml += '    <graderinfo format="html">\n';
    xml += `      <text><![CDATA[${markdownToHtml(q.explanation)}]]></text>\n`;
    xml += '    </graderinfo>\n';
  }

  xml += '  </question>\n';
  return xml;
}

function escapeXML(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function downloadMoodleXML(xml, filename) {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}