import React, { createContext, useContext, useMemo, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const theme = 'brand';

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.dataset.theme = 'brand';
    localStorage.removeItem('rawajcard_theme');
  }, []);

  const setTheme = () => {};
  const toggleTheme = () => {};

  const isDark = false;
  const contextValue = useMemo(() => ({ theme, setTheme, toggleTheme, isDark }), [theme, isDark]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;