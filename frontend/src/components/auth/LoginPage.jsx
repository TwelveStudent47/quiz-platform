import React from 'react';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const LoginPage = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Platform</h1>
        <p className="text-gray-600 mb-6">Tanulj okosabban, ne keményebben</p>
        <Button
          onClick={login}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Belépés Google fiókkal
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
