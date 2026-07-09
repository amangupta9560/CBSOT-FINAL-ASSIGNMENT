import { useState, useEffect, useRef } from 'react';

/**
 * Custom polling hook that executes a function at a specified interval
 * until a termination condition is met or it is manually stopped.
 * 
 * @param {Function} pollingFn - The async function to execute. Must return a promise.
 * @param {number} interval - Polling interval in milliseconds (default: 3000).
 * @param {Function} stopCondition - Function that accepts the result of pollingFn and returns a boolean.
 */
const usePolling = (pollingFn, interval = 3000, stopCondition = () => false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(false);
  
  const timerRef = useRef(null);
  const fnRef = useRef(pollingFn);
  const condRef = useRef(stopCondition);

  // Keep references fresh
  useEffect(() => {
    fnRef.current = pollingFn;
    condRef.current = stopCondition;
  }, [pollingFn, stopCondition]);

  const stopPolling = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActive(false);
  };

  const startPolling = (...args) => {
    stopPolling(); // Clean up existing
    setLoading(true);
    setError(null);
    setActive(true);

    const execute = async () => {
      try {
        const result = await fnRef.current(...args);
        setData(result);
        
        if (condRef.current(result)) {
          stopPolling();
        }
      } catch (err) {
        setError(err);
        stopPolling();
      } finally {
        setLoading(false);
      }
    };

    // Run immediately once
    execute();

    // Set interval for subsequent runs
    timerRef.current = setInterval(execute, interval);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, []);

  return {
    data,
    loading,
    error,
    active,
    start: startPolling,
    stop: stopPolling,
  };
};

export default usePolling;
