import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Bu komponentin yeganə məqsədi, hər URL dəyişikliyində səhifəni yuxarı qaldırmaqdır.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]); // Bu effekt, "pathname" (yəni URL yolu) dəyişdikdə işə düşür

  return null; // Bu komponentin özünün heç bir vizual görünüşü yoxdur
};

export default ScrollToTop;
