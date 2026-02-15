import React, { useState, useEffect } from 'react';
import { BarChart2, Trophy, Activity } from 'lucide-react';

const TopicStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/stats/topics`, {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Hiba a statisztikák betöltésekor');

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6"></div>;
  if (error || stats.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        Témaköri Teljesítmény
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.topic} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2" title={stat.topic}>{stat.topic}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                stat.avg_percentage >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                stat.avg_percentage >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {Math.round(stat.avg_percentage)}%
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Kitöltések:</span>
                <span className="font-medium">{stat.attempt_count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> Legjobb:</span>
                <span className="font-medium">{Math.round(stat.best_percentage)}%</span>
              </div>
            </div>

            <div className="mt-3 h-1.5 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${stat.avg_percentage >= 80 ? 'bg-green-500' : stat.avg_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${stat.avg_percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicStats;