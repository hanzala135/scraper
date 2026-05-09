import { useState, useRef, useCallback } from 'react';
import { startScrape } from '../api';

const initialState = {
  running:  false,
  logs:     [],
  results:  null,
  runId:    null,
  error:    null,
  task:     null,
};

export const useScraper = (onDone) => {
  const [state, setState] = useState(initialState);
  const esRef = useRef(null);

  const addLog = useCallback((msg, level = 'info') => {
    setState(s => ({ ...s, logs: [...s.logs, { msg, level, t: new Date() }] }));
  }, []);

  const run = useCallback((task) => {
    if (state.running) return;

    // Reset
    setState({ ...initialState, running: true, task, logs: [] });

    const es = startScrape(task);
    esRef.current = es;

    es.addEventListener('log', (e) => {
      const { msg, level } = JSON.parse(e.data);
      addLog(msg, level);
    });

    es.addEventListener('run_created', (e) => {
      const { runId } = JSON.parse(e.data);
      setState(s => ({ ...s, runId }));
    });

    es.addEventListener('result', (e) => {
      const payload = JSON.parse(e.data);
      setState(s => ({
  ...s,
  running: false,
  results: {
    nswPlanning: payload.data.nsw,
    hounslowBuilding: payload.data.hounslow,
  },
  runId: payload.runId,
}));
      es.close();
      onDone?.();
    });

    es.addEventListener('error', (e) => {
      try {
        const { message } = JSON.parse(e.data);
        setState(s => ({ ...s, running: false, error: message }));
      } catch {
        setState(s => ({ ...s, running: false, error: 'Connection error' }));
      }
      es.close();
    });

    es.onerror = () => {
      setState(s => ({ ...s, running: false, error: 'Stream closed unexpectedly' }));
      es.close();
    };
  }, [state.running, addLog, onDone]);

  const reset = useCallback(() => {
    esRef.current?.close();
    setState(initialState);
  }, []);

  return { ...state, run, reset };
};
