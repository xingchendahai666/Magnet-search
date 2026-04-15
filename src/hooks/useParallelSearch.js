/**
 * 并行搜索 Hook - Vercel 优化版
 */
import { useState, useCallback, useRef } from 'react';

// ✅ 修复：直接使用相对路径，Vercel 上永远用 /api
const API_BASE = '/api';

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
      // ✅ 创建 AbortController 用于取消请求
      abortControllerRef.current = new AbortController();

      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          query: params.query,
          engines: params.engines || [],
          categories: params.categories || ['all'],
          limit: params.limit || 50
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
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
    setError(null);
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
