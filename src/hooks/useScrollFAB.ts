import { useState, useRef, useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

export function useScrollFAB() {
  const [isFabVisible, setIsFabVisible] = useState(true);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (currentY > 40) {
      if (diff > 12 && isFabVisible) {
        setIsFabVisible(false);
      } else if (diff < -12 && !isFabVisible) {
        setIsFabVisible(true);
      }
    } else if (!isFabVisible) {
      setIsFabVisible(true);
    }

    lastScrollY.current = currentY;
  }, [isFabVisible]);

  return { isFabVisible, handleScroll };
}
