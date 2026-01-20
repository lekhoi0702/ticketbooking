/**
 * useAsync Hook
 * Handle async operations with loading, error, and data states
 */

import { useState, useCallback, useEffect } from 'react';

export const useAsync = (asyncFunction, immediate = true, dependencies = []) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Derived states
  const isIdle = status === 'idle';
  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  // Execute async function
  const execute = useCallback((...args) => {
    setStatus('loading');
    setData(null);
    setError(null);

    return asyncFunction(...args)
      .then((response) => {
        setData(response);
        setStatus('success');
        return response;
      })
      .catch((err) => {
        setError(err);
        setStatus('error');
        throw err;
      });
  }, [asyncFunction]);

  // Reset state
  const reset = useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  // Execute on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    execute,
    reset,
    status,
    data,
    error,
    isIdle,
    isLoading,
    isSuccess,
    isError,
  };
};

export default useAsync;
