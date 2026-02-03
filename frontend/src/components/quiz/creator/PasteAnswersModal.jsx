import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const PasteAnswersModal = ({ isOpen, onClose, onApply }) => {
  const [text, setText] = useState('');
  const [parsedOptions, setParsedOptions] = useState([]);
  const [error, setError] = useState('');
  const [format, setFormat] = useState('');

  useEffect(() => {
    if (!text.trim()) {
      setParsedOptions([]);
      setError('');
      setFormat('');
      return;
    }

    // Parse: soronként vagy pontosvesszővel elválasztva
    let options = [];
    let detectedFormat = '';

    if (text.includes(';')) {
      // Pontosvesszővel elválasztva
      options = text.split(';').map(opt => opt.trim()).filter(opt => opt.length > 0);
      detectedFormat = 'Pontosvesszővel elválasztva';
    } else {
      // Soronként
      options = text.split('\n').map(opt => opt.trim()).filter(opt => opt.length > 0);
      detectedFormat = 'Soronként';
    }

    setFormat(detectedFormat);

    // Validáció
    if (options.length < 2) {
      setError('Legalább 2 választ adj meg!');
      setParsedOptions([]);
    } else if (options.length > 6) {
      setError(`Túl sok válasz (${options.length}). Maximum 6 válasz engedélyezett. Az első 6 kerül felhasználásra.`);
      setParsedOptions(options.slice(0, 6));
    } else {
      setError('');
      setParsedOptions(options);
    }
  }, [text]);

  const handleApply = () => {
    if (parsedOptions.length >= 2 && parsedOptions.length <= 6) {
      onApply(parsedOptions);
      setText('');
      onClose();
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      console.error('Vágólap olvasási hiba:', err);
      setError('Nem sikerült beolvasni a vágólapot. Másold be manuálisan!');
    }
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Válaszok beillesztése" size="md">
      <div className="space-y-4">
        {/* Útmutató */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm transition-colors">
          <p className="font-medium text-blue-900 dark:text-blue-100 mb-1 transition-colors">Formátumok:</p>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc transition-colors">
            <li><strong>Soronként:</strong> Minden sor egy válasz</li>
            <li><strong>Pontosvesszővel:</strong> Válaszok pontosvesszővel elválasztva (pl. "Válasz1;Válasz2;Válasz3")</li>
          </ul>
          <p className="text-blue-700 dark:text-blue-300 mt-2 transition-colors">
            💡 Minimum 2, maximum 6 válasz adható meg.
          </p>
        </div>

        {/* Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
              Illeszd be a válaszokat
            </label>
            <button
              onClick={handlePaste}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline transition-colors"
              type="button"
            >
              Beillesztés vágólapról
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Válasz 1&#10;Válasz 2&#10;Válasz 3&#10;Válasz 4&#10;&#10;vagy&#10;&#10;Válasz1;Válasz2;Válasz3;Válasz4"
            className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors resize-none"
          />
        </div>

        {/* Formátum felismerés */}
        {format && (
          <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors">
            <strong>Felismert formátum:</strong> {format}
          </div>
        )}

        {/* Hibaüzenet */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 transition-colors">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5 transition-colors" />
            <p className="text-sm text-red-800 dark:text-red-200 transition-colors">{error}</p>
          </div>
        )}

        {/* Preview */}
        {parsedOptions.length > 0 && !error && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 transition-colors" />
              <p className="text-sm font-medium text-green-900 dark:text-green-100 transition-colors">
                {parsedOptions.length} válasz felismerve
              </p>
            </div>
            <div className="space-y-1 ml-7">
              {parsedOptions.map((option, index) => (
                <div key={index} className="text-sm text-green-800 dark:text-green-200 transition-colors">
                  <span className="font-medium">{index + 1}.</span> {option}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gombok */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            type="button"
          >
            Mégse
          </button>
          <button
            onClick={handleApply}
            disabled={parsedOptions.length < 2 || parsedOptions.length > 6}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            Alkalmaz
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PasteAnswersModal;
