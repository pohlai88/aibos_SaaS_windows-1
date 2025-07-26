import { useEffect, useState } from 'react';

/**
 * Universal hook to prevent SSR hydration mismatches
 * Ensures client-only logic only runs after component is mounted
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
