import { useMemo } from 'react';
import { TimeOption } from '../../../types';

export function useTimeOptions() {
  return useMemo(() => {
    const options: TimeOption[] = [];
    for (let h = 0; h <= 23; h++) {
      for (let m = 0; m < 60; m += 15) {
        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        options.push({ value: `${h}-${m}`, label: time });
      }
    }
    return options;
  }, []);
}
