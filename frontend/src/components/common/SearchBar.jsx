import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Keresés...', 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
      />
    </div>
  );
};

export default SearchBar;