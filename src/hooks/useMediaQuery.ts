import { useLayoutEffect, useState } from 'react';

type MediaQueryListener = (event: MediaQueryListEvent) => void;

const useMediaQuery = (): {
  isSmall: boolean;
} => {
  const [isSmall, setIsSmall] = useState<boolean>(
    window.matchMedia('(max-width: 768px)').matches,
  );

  useLayoutEffect(() => {
    const smallMediaQuery = window.matchMedia('(max-width: 768px)');

    setIsSmall(smallMediaQuery.matches);

    const listenerSmall: MediaQueryListener = (event) => {
      setIsSmall(event.matches);
    };

    smallMediaQuery.addEventListener('change', listenerSmall);

    return () => {
      smallMediaQuery.removeEventListener('change', listenerSmall);
    };
  }, []);

  return { isSmall };
};

export default useMediaQuery;
