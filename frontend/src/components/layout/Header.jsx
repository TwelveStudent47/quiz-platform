import React, { useState } from 'react';
import { BookOpen, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import DarkModeToggle from '../common/DarkModeToggle';

const Header = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'upload', label: 'Feltöltés' },
    { id: 'create', label: 'Kérdés Készítő' }
  ];

  const handleNavClick = (viewId) => {
    onViewChange(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">Exami</span>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4 items-center">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 rounded-lg transition font-medium ${
                  currentView === item.id 
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Dark Mode Toggle - Desktop */}
            <DarkModeToggle />
            
            {/* Desktop User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <Avatar name={user.name} size="md" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{user.name}</span>
              </button>
              
              {showUserMenu && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900 border border-gray-200 dark:border-gray-700 py-1 z-40">
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Kilépés
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Dark Mode Toggle - Mobile */}
            <DarkModeToggle />
            
            {/* Mobile User Avatar */}
            <Avatar name={user.name} size="sm" />
            
            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t dark:border-gray-700 pt-4">
            <div className="flex flex-col space-y-2">
              {/* Mobile Nav Items */}
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-3 rounded-lg transition text-left font-medium ${
                    currentView === item.id 
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile User Info */}
              <div className="pt-4 border-t dark:border-gray-700">
                <div className="px-4 py-2 flex items-center gap-3">
                  <Avatar name={user.name} size="md" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{user.name}</span>
                </div>
                
                {/* Mobile Logout */}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-lg mt-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Kilépés
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;