import { createSlice } from '@reduxjs/toolkit';

const storageKey = 'vite-ui-theme';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem(storageKey);
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system')) {
      return storedTheme;
    }
  }
  return 'system'; // Default theme
};

const applyThemeToDOM = (theme) => {
  if (typeof window !== 'undefined') {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: getInitialTheme(),
  },
  reducers: {
    setTheme: (state, action) => {
      const newTheme = action.payload;
      if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
        localStorage.setItem(storageKey, newTheme);
        state.theme = newTheme;
        applyThemeToDOM(newTheme);
      }
    },
  },
});

export const { setTheme } = themeSlice.actions;

export const selectTheme = (state) => state.theme.theme;

export default themeSlice.reducer;