import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Moon, Sun, LogOut, User, Globe } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, languages } = useLanguage();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-primary">
            SmartAcad
          </Link>
          
          <div className="flex items-center space-x-4">
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="px-3 py-1 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {user && (
              <>
                <div className="flex items-center space-x-2">
                  <User size={20} />
                  <span className="font-medium">{user.name}</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-primary text-white">
                    {user.role}
                  </span>
                </div>
                
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
