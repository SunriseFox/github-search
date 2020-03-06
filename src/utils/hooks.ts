import { useReducer, useRef, MutableRefObject } from 'react';

const reducer = () => {
  return {};
};

export function useEffectiveRef<T>() {
  const proxy = useRef<MutableRefObject<T>>(null);
  const [, dispatch] = useReducer(reducer, { current: null });
  if (!proxy.current)
    proxy.current = new Proxy(
      { current: null },
      {
        set(target, property, value) {
          if (property !== 'current') return false;
          if (target.current == null) {
            target.current = value;
            dispatch();
          }
          return true;
        },
      }
    );
  return proxy.current;
}
