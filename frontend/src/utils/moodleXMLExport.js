const convertClozeToMoodle = (question, escapeXML) => {
  let moodleText = question.data.text || '';
  
  (question.data.blanks || []).forEach((blank, idx) => {
    const placeholder = `{${idx}}`;
    let moodleBlank = '';
    
    if (blank.type === 'dropdown') {
      const options = blank.options.map((opt, optIdx) => {
        const isCorrect = optIdx === blank.correctIndex;
        return `${isCorrect ? '=' : ''}${escapeXML(opt)}`;
      }).join('~');
      
      moodleBlank = `{${idx + 1}:MULTICHOICE:~${options}}`;
    } else if (blank.type === 'text') {
      moodleBlank = `{${idx + 1}:SHORTANSWER:=${escapeXML(blank.correctAnswer)}}`;
    }
    
    moodleText = moodleText.replace(placeholder, moodleBlank);
  });
  
  let xml = '  <question type="cloze">\n';
  xml += '    <n>\n';
  xml += `      <text>${escapeXML(question.text || 'Cloze Question')}</text>\n`;
  xml += '    </n>\n';
  xml += '    <questiontext format="html">\n';
  xml += `      <text><![CDATA[${moodleText}]]></text>\n`;
  xml += '    </questiontext>\n';
  xml += '    <generalfeedback format="html">\n';
  xml += `      <text>${escapeXML(question.explanation || '')}</text>\n`;
  xml += '    </generalfeedback>\n';
  xml += `    <defaultgrade>${question.points || 1}</defaultgrade>\n`;
  xml += '    <penalty>0.1</penalty>\n';
  xml += '    <hidden>0</hidden>\n';
  xml += '  </question>\n\n';
  
  return xml;
};

export const exportToMoodleXML = (quiz) => {
  const { title, topic, description, questions } = quiz;
  
  const escapeXML = (text) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const wrapCDATA = (text) => {
    if (!text) return '<text></text>';

    if (/<[^>]+>/.test(text) || /[&<>"]/.test(text)) {
      return `<text><![CDATA[${text}]]></text>`;
    }
    return `<text>${text}</text>`;
  };

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<quiz>\n';

  if (topic) {
    xml += '  <question type="category">\n';
    xml += '    <category>\n';
    xml += `      <text>$course$/${escapeXML(topic)}</text>\n`;
    xml += '    </category>\n';
    xml += '  </question>\n\n';
  }

  questions.forEach((question, index) => {
    xml += `  <!-- Question ${index + 1}: ${escapeXML(question.text.substring(0, 50))}... -->\n`;
    
    switch (question.type) {
      case 'single_choice':
        xml += generateMultipleChoice(question, false);
        break;
      case 'multiple_choice':
        xml += generateMultipleChoice(question, true);
        break;
      case 'true_false':
        xml += generateTrueFalse(question);
        break;
      case 'numeric':
        xml += generateNumeric(question);
        break;
      case 'matching':
        xml += generateMatching(question);
        break;
      case 'cloze':
        xml += convertClozeToMoodle(question, escapeXML);
        break;
      default:
        console.warn(`Unknown question type: ${question.type}`);
    }
    xml += '\n';
  });

  xml += '</quiz>';
  return xml;

  function generateMultipleChoice(q, isMultiple) {
    let qXML = '  <question type="multichoice">\n';
    
    qXML += '    <name>\n';
    qXML += `      ${wrapCDATA(q.text.substring(0, 100))}\n`;
    qXML += '    </name>\n';

    qXML += '    <questiontext format="html">\n';
    let questionHTML = escapeXML(q.text);
    if (q.image) {
      questionHTML += `<br/><img src="${q.image}" alt="Question image" style="max-width: 100%;"/>`;
    }
    qXML += `      ${wrapCDATA(questionHTML)}\n`;
    qXML += '    </questiontext>\n';

    qXML += `    <defaultgrade>${q.points || 1}</defaultgrade>\n`;

    qXML += '    <penalty>0.1</penalty>\n';
    
    qXML += `    <single>${isMultiple ? 'false' : 'true'}</single>\n`;

    qXML += '    <shuffleanswers>true</shuffleanswers>\n';

    qXML += '    <answernumbering>abc</answernumbering>\n';

    const options = q.data.options || [];
    options.forEach((option, idx) => {
      let fraction = 0;
      
      if (isMultiple) {
        const correctIndices = q.data.correctIndices || [];
        if (correctIndices.includes(idx)) {
          fraction = Math.round(100 / correctIndices.length);
        }
      } else {
        fraction = (q.data.correctIndex === idx) ? 100 : 0;
      }
      
      qXML += `    <answer fraction="${fraction}" format="html">\n`;
      qXML += `      ${wrapCDATA(escapeXML(option))}\n`;
      if (q.explanation && fraction > 0) {
        qXML += '      <feedback format="html">\n';
        qXML += `        ${wrapCDATA(escapeXML(q.explanation))}\n`;
        qXML += '      </feedback>\n';
      }
      qXML += '    </answer>\n';
    });

    if (q.explanation) {
      qXML += '    <generalfeedback format="html">\n';
      qXML += `      ${wrapCDATA(escapeXML(q.explanation))}\n`;
      qXML += '    </generalfeedback>\n';
    }
    
    qXML += '  </question>\n';
    return qXML;
  }

  function generateTrueFalse(q) {
    let qXML = '  <question type="truefalse">\n';

    qXML += '    <name>\n';
    qXML += `      ${wrapCDATA(q.text.substring(0, 100))}\n`;
    qXML += '    </name>\n';

    qXML += '    <questiontext format="html">\n';
    let questionHTML = escapeXML(q.text);
    if (q.image) {
      questionHTML += `<br/><img src="${q.image}" alt="Question image" style="max-width: 100%;"/>`;
    }
    qXML += `      ${wrapCDATA(questionHTML)}\n`;
    qXML += '    </questiontext>\n';

    qXML += `    <defaultgrade>${q.points || 1}</defaultgrade>\n`;

    qXML += '    <penalty>0.1</penalty>\n';

    qXML += `    <answer fraction="${q.data.correctAnswer === true ? 100 : 0}" format="moodle_auto_format">\n`;
    qXML += '      <text>true</text>\n';
    if (q.explanation && q.data.correctAnswer === true) {
      qXML += '      <feedback format="html">\n';
      qXML += `        ${wrapCDATA(escapeXML(q.explanation))}\n`;
      qXML += '      </feedback>\n';
    }
    qXML += '    </answer>\n';

    qXML += `    <answer fraction="${q.data.correctAnswer === false ? 100 : 0}" format="moodle_auto_format">\n`;
    qXML += '      <text>false</text>\n';
    if (q.explanation && q.data.correctAnswer === false) {
      qXML += '      <feedback format="html">\n';
      qXML += `        ${wrapCDATA(escapeXML(q.explanation))}\n`;
      qXML += '      </feedback>\n';
    }
    qXML += '    </answer>\n';
    
    qXML += '  </question>\n';
    return qXML;
  }

  function generateNumeric(q) {
    let qXML = '  <question type="numerical">\n';

    qXML += '    <name>\n';
    qXML += `      ${wrapCDATA(q.text.substring(0, 100))}\n`;
    qXML += '    </name>\n';

    qXML += '    <questiontext format="html">\n';
    let questionHTML = escapeXML(q.text);
    if (q.image) {
      questionHTML += `<br/><img src="${q.image}" alt="Question image" style="max-width: 100%;"/>`;
    }
    qXML += `      ${wrapCDATA(questionHTML)}\n`;
    qXML += '    </questiontext>\n';

    qXML += `    <defaultgrade>${q.points || 1}</defaultgrade>\n`;

    qXML += '    <penalty>0.1</penalty>\n';

    qXML += '    <answer fraction="100" format="moodle_auto_format">\n';
    qXML += `      <text>${q.data.correctAnswer}</text>\n`;
    qXML += '      <tolerance>0.01</tolerance>\n';
    if (q.explanation) {
      qXML += '      <feedback format="html">\n';
      qXML += `        ${wrapCDATA(escapeXML(q.explanation))}\n`;
      qXML += '      </feedback>\n';
    }
    qXML += '    </answer>\n';

    if (q.data.unit) {
      qXML += '    <units>\n';
      qXML += '      <unit>\n';
      qXML += `        <multiplier>1</multiplier>\n`;
      qXML += `        <unit_name>${escapeXML(q.data.unit)}</unit_name>\n`;
      qXML += '      </unit>\n';
      qXML += '    </units>\n';
    }
    
    qXML += '  </question>\n';
    return qXML;
  }

  function generateMatching(q) {
    let qXML = '  <question type="matching">\n';

    qXML += '    <name>\n';
    qXML += `      ${wrapCDATA(q.text.substring(0, 100))}\n`;
    qXML += '    </name>\n';

    qXML += '    <questiontext format="html">\n';
    let questionHTML = escapeXML(q.text);
    if (q.image) {
      questionHTML += `<br/><img src="${q.image}" alt="Question image" style="max-width: 100%;"/>`;
    }
    qXML += `      ${wrapCDATA(questionHTML)}\n`;
    qXML += '    </questiontext>\n';

    qXML += `    <defaultgrade>${q.points || 1}</defaultgrade>\n`;

    qXML += '    <penalty>0.1</penalty>\n';

    qXML += '    <shuffleanswers>true</shuffleanswers>\n';

    const pairs = q.data.pairs || [];
    pairs.forEach(pair => {
      qXML += '    <subquestion format="html">\n';
      qXML += `      ${wrapCDATA(escapeXML(pair.left))}\n`;
      qXML += '      <answer>\n';
      qXML += `        ${wrapCDATA(escapeXML(pair.right))}\n`;
      qXML += '      </answer>\n';
      qXML += '    </subquestion>\n';
    });

    if (q.explanation) {
      qXML += '    <generalfeedback format="html">\n';
      qXML += `      ${wrapCDATA(escapeXML(q.explanation))}\n`;
      qXML += '    </generalfeedback>\n';
    }
    
    qXML += '  </question>\n';
    return qXML;
  }
};

export const downloadMoodleXML = (xml, filename) => {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'moodle-quiz.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};