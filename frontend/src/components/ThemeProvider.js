import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [colorScheme, setColorScheme] = useState('blue');
  const [layout, setLayout] = useState('comfortable');

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedColorScheme = localStorage.getItem('colorScheme') || 'blue';
    const savedLayout = localStorage.getItem('layout') || 'comfortable';
    
    setTheme(savedTheme);
    setColorScheme(savedColorScheme);
    setLayout(savedLayout);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-color', savedColorScheme);
    document.documentElement.setAttribute('data-layout', savedLayout);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const changeColorScheme = (scheme) => {
    setColorScheme(scheme);
    localStorage.setItem('colorScheme', scheme);
    document.documentElement.setAttribute('data-color', scheme);
  };

  const changeLayout = (layoutType) => {
    setLayout(layoutType);
    localStorage.setItem('layout', layoutType);
    document.documentElement.setAttribute('data-layout', layoutType);
  };

  const value = {
    theme,
    colorScheme,
    layout,
    toggleTheme,
    changeColorScheme,
    changeLayout,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}