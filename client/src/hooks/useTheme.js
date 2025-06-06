import { useDispatch, useSelector } from 'react-redux';
import { selectTheme, setTheme } from '../redux/slicers/ThemeSlice';

export const useTheme = () => {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  
  const updateTheme = (newTheme) => {
    dispatch(setTheme(newTheme));
  };
  
  return {
    theme,
    setTheme: updateTheme,
  };
};