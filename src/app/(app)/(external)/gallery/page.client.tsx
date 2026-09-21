'use client';

import { useEffect } from 'react';

export default function PageClient() {
  useEffect(() => {
    document.body.classList.add('hmm-theme-external');
    return () => {
      document.body.classList.remove('hmm-theme-external');
    };
  }, []);

  return null;
}
