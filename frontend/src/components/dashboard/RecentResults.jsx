import React from 'react';
import { TrendingUp, Eye, List } from 'lucide-react';
import Card, { CardBody } from '../common/Card';
import Button from '../common/Button';

const RecentResults = ({ history, onReviewAttempt, onViewAllResults }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hu-HU');
  };

  return (
    <Card>
      <CardBody>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Legutóbbi Eredmények
          </h2>
          {history.length > 0 && (
            <Button
              onClick={onViewAllResults}
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <List className="w-4 h-4" />
              Összes Eredmény
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Még nincs kitöltött teszt</p>
          ) : (
            history.slice(0, 5).map((attempt) => (
              <div key={attempt.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{attempt.quiz_title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(attempt.completed_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      attempt.percentage >= 70 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {Math.round(attempt.percentage)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {attempt.score}/{attempt.total_points} pont
                    </div>
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReviewAttempt(attempt);
                  }}
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Visszanézés
                </Button>
              </div>
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default RecentResults;