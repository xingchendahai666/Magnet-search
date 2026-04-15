/**
 * 并行搜索 Hook - Vercel 优化版
 */
import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

export const useParallelSearch = () => {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(null);
  const [engineStatus, setEngineStatus] = useState({});
  const [stats, setStats] = useState({ total: 0, enginesUsed: 0, duration: 0 });
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  const startSearch = useCallback(async (params) => {
    setResults([]);
    setIsSearching(true);
    setError(null);
    setProgress({ total: 0, completed: 0, percentage: 0 });
    setEngineStatus({});
    
    const startTime = Date.now();

    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: params.query,
          engines: params.engines || [],
          categories: params.categories || ['all'],
          limit: params.limit || 50
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setResults(data.results || []);
      setStats({
        total: data.totalResults || 0,
        enginesUsed: data.engineStats?.length || 0,
        duration: Date.now() - startTime
      });
      setEngineStatus(
        (data.engineStats || []).reduce((acc, stat) => ({
          ...acc,
          [stat.name]: stat.status
        }), {})
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const stopSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsSearching(false);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setStats({ total: 0, enginesUsed: 0, duration: 0 });
  }, []);

  return {
    results,
    isSearching,
    progress,
    engineStatus,
    stats,
    error,
    startSearch,
    stopSearch,
    clearResults
  };
};

