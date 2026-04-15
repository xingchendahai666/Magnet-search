import React, { useState, useCallback, useRef } from 'react';
import { Search, Zap, Filter } from 'lucide-react';
import { useParallelSearch } from '../../hooks/useParallelSearch.js';
import { EngineCarousel } from './EngineCarousel';
import LiveResults from './LiveResults';
import './ParallelSearch.css';

const ParallelSearch = () => {
  const [query, setQuery] = useState('');
  const [selectedEngines, setSelectedEngines] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const inputRef = useRef(null);

  const {
    results,
    isSearching,
    stats,
    error,
    startSearch,
    clearResults
  } = useParallelSearch();

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    startSearch({
      query: query.trim(),
      engines: selectedEngines.length > 0 ? selectedEngines : undefined,
      categories: selectedCategories
    });
  }, [query, selectedEngines, selectedCategories, isSearching, startSearch]);

  const categories = [
    { id: 'all', label: '全部', icon: '🌐' },
    { id: 'video', label: '视频', icon: '🎬' },
    { id: 'audio', label: '音频', icon: '🎵' },
    { id: 'applications', label: '软件', icon: '💻' },
    { id: 'games', label: '游戏', icon: '🎮' },
  ];

  return (
    <div className="parallel-search">
      <div className="aurora-bg" />

      <div className="search-hero">
        <h1 className="search-title">
          <Zap className="title-icon" size={32} />
          极速磁力搜索
        </h1>
        <p className="search-subtitle">同时搜索多个引擎，实时聚合结果</p>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="输入关键词搜索磁力链接..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="button" 
              className="filter-toggle"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            >
              <Filter size={18} />
            </button>
          </div>

          <button 
            type="submit" 
            className="search-button"
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? '搜索中...' : '立即搜索'}
          </button>
        </form>

        <div className="category-tags">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tag ${selectedCategories.includes(cat.id) ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategories(prev => 
                  cat.id === 'all' 
                    ? ['all']
                    : prev.includes(cat.id)
                      ? prev.filter(c => c !== cat.id)
                      : [...prev.filter(c => c !== 'all'), cat.id]
                );
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {isAdvancedOpen && (
        <div className="advanced-panel">
          <EngineCarousel 
            selected={selectedEngines}
            onSelect={setSelectedEngines}
          />
        </div>
      )}

      <LiveResults 
        results={results}
        isSearching={isSearching}
        onClear={clearResults}
      />

      {error && (
        <div className="error-toast">
          <span>⚠️ {error}</span>
          <button onClick={() => window.location.reload()}>刷新</button>
        </div>
      )}
    </div>
  );
};

export default ParallelSearch;
