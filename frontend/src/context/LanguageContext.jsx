import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const languages = [
  { code: 'English', name: 'English' },
  { code: 'Bahasa Melayu', name: 'Bahasa Melayu' },
  { code: 'Arabic', name: 'العربية' },
  { code: 'French', name: 'Français' },
  { code: 'Mandarin', name: '中文' },
  { code: 'Tamil', name: 'தமிழ்' },
  { code: 'Spanish', name: 'Español' },
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
