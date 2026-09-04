import { useEffect, useRef, useState } from 'react';

export type AsyncState<T> =
  | { state: 'loading'; data: null; error: null }
  | { state: 'success'; data: T; error: null }
  | { state: 'empty'; data: null; error: null }
  | { state: 'error'; data: null; error: string };

/**
 * Hook d'état asynchrone : reproduit les états obligatoires d'une page
 * (loading / success / empty / error). `deps` contrôle le rechargement.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ state: 'loading', data: null, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let active = true;
    setState({ state: 'loading', data: null, error: null });
    fnRef
      .current()
      .then((data) => {
        if (!active) return;
        setState(
          Array.isArray(data) && data.length === 0
            ? { state: 'empty', data: null, error: null }
            : { state: 'success', data, error: null },
        );
      })
      .catch((err: unknown) => {
        if (!active) return;
        setState({ state: 'error', data: null, error: err instanceof Error ? err.message : 'error' });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
