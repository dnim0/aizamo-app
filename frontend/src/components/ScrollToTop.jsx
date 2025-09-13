import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll to top on every route change (prevents restored deep scroll). */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' }); // 'auto' to avoid motion-jank
  }, [pathname]);
  return null;
}