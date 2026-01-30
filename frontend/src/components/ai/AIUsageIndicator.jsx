import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, Check } from 'lucide-react';
import { apiFetch, API_URL } from '../../utils/constants';

const AIUsageIndicator = ({ inline = false }) => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const data = await apiFetch(`${API_URL}/api/ai/usage`);
      setUsage(data);
    } catch (err) {
      console.error('Failed to fetch AI usage:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
        <span>Betöltés...</span>
      </div>
    );
  }

  if (!usage) return null;

  const percentage = (usage.quota_used / usage.quota_limit) * 100;
  const remaining = usage.remaining;
  const isLow = remaining <= 1;
  const isExceeded = remaining <= 0;

  if (inline) {
    // Compact inline version
    return (
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className={`w-4 h-4 ${
          isExceeded ? 'text-red-500' : 
          isLow ? 'text-orange-500' : 
          'text-indigo-600 dark:text-indigo-400'
        }`} />
        <span className={`font-medium ${
          isExceeded ? 'text-red-600 dark:text-red-400' : 
          isLow ? 'text-orange-600 dark:text-orange-400' : 
          'text-gray-700 dark:text-gray-300'
        }`}>
          {remaining}/{usage.quota_limit} AI teszt maradt
        </span>
      </div>
    );
  }

  // Full card version
  return (
    <div className={`p-4 rounded-lg border-2 transition-colors ${
      isExceeded 
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' 
        : isLow
        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
        : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${
            isExceeded ? 'text-red-600 dark:text-red-400' : 
            isLow ? 'text-orange-600 dark:text-orange-400' : 
            'text-indigo-600 dark:text-indigo-400'
          }`} />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            AI Teszt Generálás
          </h3>
        </div>
        
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          usage.plan === 'free' 
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
            : 'bg-indigo-200 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-300'
        }`}>
          {usage.plan === 'free' ? 'Ingyenes' : usage.plan.toUpperCase()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            Felhasznált ezen a hónapon
          </span>
          <span className={`font-bold ${
            isExceeded ? 'text-red-600 dark:text-red-400' : 
            isLow ? 'text-orange-600 dark:text-orange-400' : 
            'text-indigo-600 dark:text-indigo-400'
          }`}>
            {usage.quota_used} / {usage.quota_limit}
          </span>
        </div>
        
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              isExceeded ? 'bg-red-500' : 
              isLow ? 'bg-orange-500' : 
              'bg-indigo-600 dark:bg-indigo-400'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Status message */}
      <div className={`flex items-start gap-2 text-sm ${
        isExceeded ? 'text-red-700 dark:text-red-300' : 
        isLow ? 'text-orange-700 dark:text-orange-300' : 
        'text-indigo-700 dark:text-indigo-300'
      }`}>
        {isExceeded ? (
          <>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Elérted a havi limitet</p>
              <p className="text-xs mt-1 opacity-90">
                Újratöltés: {new Date(usage.reset_date).toLocaleDateString('hu-HU')}
              </p>
            </div>
          </>
        ) : isLow ? (
          <>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{remaining} generálás maradt</p>
              <p className="text-xs mt-1 opacity-90">
                Újratöltés: {new Date(usage.reset_date).toLocaleDateString('hu-HU')}
              </p>
            </div>
          </>
        ) : (
          <>
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{remaining} ingyenes generálás elérhető</p>
              <p className="text-xs mt-1 opacity-90">
                A limit minden hónap 1-én nullázódik
              </p>
            </div>
          </>
        )}
      </div>

      {/* Upgrade CTA (for future) */}
      {isExceeded && (
        <button
          className="mt-3 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          onClick={() => alert('Hamarosan elérhető lesz a prémium előfizetés!')}
        >
          Prémiumra váltás
        </button>
      )}
    </div>
  );
};

export default AIUsageIndicator;