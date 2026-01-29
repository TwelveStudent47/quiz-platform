// AIQuizGenerator.jsx - FIXED error handling

import React, { useState } from 'react';
import { Sparkles, Upload, FileText, X, Loader2 } from 'lucide-react';
import Card, { CardBody } from '../common/Card';
import Button from '../common/Button';
import { API_URL, apiFetch } from '../../utils/constants';

const AIQuizGenerator = ({ onGenerate, onClose }) => {
  const [topic, setTopic] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedTypes, setSelectedTypes] = useState({
    single_choice: true,
    multiple_choice: true,
    true_false: true,
    numeric: false,
    matching: false,
    cloze: false,
    essay: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  const toggleType = (type) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setDocumentation(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Kérlek adj meg egy témakört!');
      return;
    }

    const enabledTypes = Object.keys(selectedTypes).filter(key => selectedTypes[key]);
    if (enabledTypes.length === 0) {
      alert('Válassz ki legalább egy kérdés típust!');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('AI gondolkodik...');

    try {
      console.log('🤖 Sending AI generation request...');
      
      const data = await apiFetch(`${API_URL}/api/ai/generate-quiz`, {
        method: 'POST',
        body: JSON.stringify({
          topic,
          documentation,
          questionCount,
          difficulty,
          questionTypes: enabledTypes
        })
      });

      console.log('✅ AI Response received:', data);

      // Validate response
      if (!data || !data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid response format from AI');
      }

      if (data.questions.length === 0) {
        throw new Error('No questions generated');
      }

      setGenerationStatus('Sikeres generálás! ✓');
      
      // Pass to CreateQuizView
      setTimeout(() => {
        onGenerate(data);
        onClose();
      }, 500);
      
    } catch (err) {
      console.error('❌ AI Generation error:', err);
      
      // Better error messages
      let errorMessage = 'Hiba történt a generálás során.';
      
      if (err.message.includes('AI Quota Exceeded') || err.message.includes('429')) {
        errorMessage = '⚠️ Elérted a havi 5 ingyenes AI teszt limitet!\n\nA limit minden hónap 1-én nullázódik.';
      } else if (err.message.includes('Invalid response format')) {
        errorMessage = 'Az AI válasz formátuma hibás. Próbáld újra!';
      } else if (err.message.includes('No questions generated')) {
        errorMessage = 'Az AI nem tudott kérdéseket generálni. Próbálj más témát!';
      } else if (err.message.includes('Network')) {
        errorMessage = 'Hálózati hiba. Ellenőrizd az internetkapcsolatot!';
      }
      
      alert(errorMessage + '\n\nRészletek: ' + err.message);
      setGenerationStatus('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transition-colors">
        <Card>
          <CardBody className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">
                    AI Teszt Generálás
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    Claude AI segítségével generálj tesztet bármilyen témából
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Témakör *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="pl. JavaScript Alapok, Biológia 9. osztály, stb."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
                  disabled={isGenerating}
                />
              </div>

              {/* Documentation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Dokumentáció / Tananyag (opcionális)
                </label>
                <div className="space-y-2">
                  <textarea
                    value={documentation}
                    onChange={(e) => setDocumentation(e.target.value)}
                    placeholder="Illeszd be a tananyagot, jegyzetet vagy dokumentációt amire épüljenek a kérdések..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors resize-none"
                    disabled={isGenerating}
                  />
                  
                  {/* File Upload */}
                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-800">
                    <Upload className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      vagy tölts fel szöveges fájlt (.txt, .md)
                    </span>
                    <input
                      type="file"
                      accept=".txt,.md,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isGenerating}
                    />
                  </label>
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Kérdések száma: <span className="text-indigo-600 dark:text-indigo-400">{questionCount}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  disabled={isGenerating}
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>5</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Nehézség
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      disabled={isGenerating}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                        difficulty === level
                          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      {level === 'easy' && '😊 Könnyű'}
                      {level === 'medium' && '🤔 Közepes'}
                      {level === 'hard' && '🔥 Nehéz'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                  Kérdés típusok
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'single_choice', label: 'Egy válaszos' },
                    { key: 'multiple_choice', label: 'Több válaszos' },
                    { key: 'true_false', label: 'Igaz/Hamis' },
                    { key: 'numeric', label: 'Számos' },
                    { key: 'matching', label: 'Illesztéses' },
                    { key: 'cloze', label: 'Kitöltendő' },
                    { key: 'essay', label: 'Esszé' }
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedTypes[key]
                          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes[key]}
                        onChange={() => toggleType(key)}
                        disabled={isGenerating}
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <span className={`text-sm font-medium ${
                        selectedTypes[key]
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors">
                <div className="flex gap-3">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">💡 Tipp:</p>
                    <p>
                      Minél részletesebb dokumentációt adsz meg, annál pontosabb és relevánsabb kérdéseket tud generálni az AI. 
                      A generált kérdéseket a szerkesztőben bármikor módosíthatod!
                    </p>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  variant="primary"
                  size="lg"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generálás...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Teszt Generálása
                    </>
                  )}
                </Button>
                <Button
                  onClick={onClose}
                  disabled={isGenerating}
                  variant="secondary"
                  size="lg"
                >
                  Mégse
                </Button>
              </div>

              {/* Status */}
              {generationStatus && (
                <div className="text-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {generationStatus}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AIQuizGenerator;