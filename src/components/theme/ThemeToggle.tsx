'use client';

import React, { useSyncExternalStore } from 'react';
import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from './ThemeProvider';

function subscribe() {
  return () => {};
}

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isHydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const isDark = isHydrated ? theme === 'dark' : false;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema escuro' : 'Tema claro'}
      className="theme-switch"
    >
      <span aria-hidden="true" className={`theme-switch-track ${isDark ? 'is-dark' : 'is-light'}`}>
        <span className={`theme-switch-thumb ${isDark ? 'is-dark' : 'is-light'}`} />
        <span className="theme-switch-icons">
          <SunMedium size={16} />
          <MoonStar size={16} />
        </span>
      </span>
      <span className="sr-only">{isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}</span>
    </button>
  );
};

export default ThemeToggle;