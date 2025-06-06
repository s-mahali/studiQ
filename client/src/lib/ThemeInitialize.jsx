import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../redux/slicers/ThemeSlice';

export function ThemeInitializer() {
    const theme = useSelector(selectTheme);
  
    useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.classList.add(systemTheme);
      }
        else {
            root.classList.add(theme);
          }
        }, [theme]);
  
        return null;

    }
  