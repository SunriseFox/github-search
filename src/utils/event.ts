import { SyntheticEvent } from 'react';

export function stopItNow(e: Event | SyntheticEvent, then?: () => void) {
  e.preventDefault();
  e.stopPropagation();
  if ('stopImmediatePropagation' in e) e.stopImmediatePropagation?.();
  then?.();
}
