import { useState, useEffect } from 'react';

/**
 * Hook to detect if the component has mounted on the client.
 * Used to prevent hydration mismatches with recharts and other
 * client-only rendering (e.g., clipPath IDs differ between SSR and client).
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
