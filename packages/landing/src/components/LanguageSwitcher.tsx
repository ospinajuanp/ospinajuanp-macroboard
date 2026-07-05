'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`px-2 py-1 text-sm font-medium rounded transition-all ${
              lang.code === 'en'
                ? 'bg-macroboard-primary text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-2 py-1 text-sm font-medium rounded transition-all ${
            i18n.language === lang.code
              ? 'bg-macroboard-primary text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
