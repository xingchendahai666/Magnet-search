import React, { useState, useCallback, useRef } from 'react';
import { Search, Zap, Filter } from 'lucide-react';
import { useParallelSearch } from '../../hooks/useParallelSearch';
import EngineCarousel from './EngineCarousel';
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
          <Zap className="title-icon" />
          Magnet Search Ultimate
        </h1>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className={`search-input-wrapper ${isSearching ? 'searching' : ''}`}>
            <Search className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索磁力链接..."
              className="search-input"
              disabled={isSearching}
            />
            {query && (
              <button 
                type="button" 
                className="clear-btn"
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              >
                ×
              </button>
            )}
          </div>
          
          <button 
            type="submit" 
            className={`search-btn ${isSearching ? 'stop' : ''}`}
          >
            <Zap className="btn-icon" />
            {isSearching ? '搜索中...' : '搜索'}
          </button>
        </form>

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategories.includes(cat.id) ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategories(prev => 
                  prev.includes(cat.id)
                    ? prev.filter(c => c !== cat.id)
                    : [...prev, cat.id]
                );
              }}
            >
              <span className="cat-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <button 
          className="advanced-toggle"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          <Filter className="toggle-icon" />
          {isAdvancedOpen ? '隐藏高级选项' : '高级选项'}
        </button>

        {isAdvancedOpen && (
          <div className="advanced-panel">
            <EngineCarousel
              selected={selectedEngines}
              onSelect={setSelectedEngines}
            />
          </div>
        )}
      </div>

      {stats.total > 0 && (
        <div className="search-stats">
          <span className="stat-item">
            <strong>{stats.total}</strong> 个结果
          </span>
          <span className="stat-item">
            来自 <strong>{stats.enginesUsed}</strong> 个引擎
          </span>
          <span className="stat-item">
            耗时 <strong>{stats.duration}ms</strong>
          </span>
        </div>
      )}

      <LiveResults 
        results={results}
        isSearching={isSearching}
        onClear={clearResults}
      />

      {error && (
        <div className="error-message">
          错误: {error}
        </div>
      )}
    </div>
  );
};

export default ParallelSearch;

