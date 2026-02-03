import React from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';

const SettingsModal = ({ isOpen, onClose, preferences, onUpdate }) => {
  if (!isOpen) return null;

  const handleToggle = async (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    // Optimistic update (azonnali UI frissítés)
    onUpdate(newPrefs);
    
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/user/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newPrefs }),
        credentials: 'include'
      });
    } catch (err) {
      console.error('Failed to save preferences', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Beállítások</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Témaköri statisztikák</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Teljesítmény megjelenítése a Dashboardon</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={preferences.showTopicStats ?? false}
                onChange={() => handleToggle('showTopicStats')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 flex justify-end">
          <Button onClick={onClose} variant="primary" size="sm">Bezárás</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;