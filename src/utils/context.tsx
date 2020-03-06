import React, { useContext, useCallback, useRef, useEffect, useMemo } from 'react';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { useSubscription } from 'use-subscription';

// TODO: context type
const InputContext = React.createContext(null);

const { Provider } = InputContext;

export const InputProvider = ({ children }) => {
  const ref = useRef<HTMLInputElement>(null!);
  const callbackRef = useRef<Map<string, any[]>>(new Map());
  const eventHandler = useCallback((e: Event) => {
    const callback = callbackRef.current;
    const handlers = callback.get(e.type) || [];
    for (let handler of handlers) {
      handler(e);
    }
  }, []);
  const value = React.useMemo(
    () => ({
      ref,
      strategy: {},
      get value() {
        return value.ref.current?.value.trim() || '';
      },
      set value(v: string) {
        if (!value.ref.current) return;
        value.ref.current.value = v;
        value.dispatch('search');
      },
      setRef(newRef: React.MutableRefObject<HTMLInputElement>) {
        if (value.ref.current) {
          const element = value.ref.current;
          element.removeEventListener('input', eventHandler);
          element.removeEventListener('focus', eventHandler);
        }
        const element = newRef.current;
        if (!element) return;
        value.ref.current = element;
        element.addEventListener('input', eventHandler);
        element.addEventListener('focus', eventHandler);
      },
      subscribe(events: string | string[], handler: any) {
        if (typeof events === 'string') events = [events];
        for (const event of events) {
          const handlers = callbackRef.current.get(event) || [];
          handlers.push(handler);
          callbackRef.current.set(event, handlers);
        }
        return () => value.unsubscribe(events, handler);
      },
      unsubscribe(events: string | string[], handler: any) {
        if (typeof events === 'string') events = [events];
        for (const event of events) {
          const handlers = callbackRef.current.get(event) || [];
          callbackRef.current.set(
            event,
            handlers.filter(i => i !== handler)
          );
        }
      },
      addEventListener(...args: Parameters<typeof value['subscribe']>) {
        return value.subscribe(...args);
      },
      removeEventListener(...args: Parameters<typeof value['unsubscribe']>) {
        return value.unsubscribe(...args);
      },
      dispatch(type) {
        eventHandler(new CustomEvent(type));
      },
      setStrategy(obj?: any) {
        Object.assign(value.strategy, obj || {});
        if (obj.sort) value.dispatch('search');
        value.dispatch('strategy');
      },
      getStrategy() {
        return value.strategy;
      },
      useStrategy(key: string) {
        const strategySubscription = useMemo(
          () => ({
            getCurrentValue: () => value.getStrategy()[key] || null,
            subscribe: callback => value.subscribe('strategy', callback),
          }),
          [key]
        );
        return useSubscription(strategySubscription);
      },
    }),
    [eventHandler]
  );
  useEffect(() => {
    const subscription = fromEvent(value, 'input')
      .pipe(debounceTime(1000))
      .subscribe(() => {
        value.dispatch('search');
      });
    return () => subscription.unsubscribe();
  }, [value]);
  return <Provider value={value}>{children}</Provider>;
};

export const useInputProvider = () => {
  return useContext(InputContext);
};
