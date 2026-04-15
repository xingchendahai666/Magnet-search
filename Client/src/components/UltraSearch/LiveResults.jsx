import React, { useRef, useEffect, useState } from 'react';
import UltimateCard from '../ResultCard/UltimateCard';
import { Loader2, Trash2 } from 'lucide-react';
import './LiveResults.css';

const LiveResults = ({ results, isSearching, onClear }) => {
  const containerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [results, autoScroll]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), units.length - 1);
    return `${(bytes / Math.pow(1000, exp)).toFixed(2)} ${units[exp]}`;
  };

  return (
    <div className="live-results">
      <div className="results-header">
        <div className="header-left">
          <h3>搜索结果</h3>
          {isSearching && (
            <span className="searching-badge">
              <Loader2 className="spin" size={14} />
              搜索中...
            </span>
          )}
        </div>
        
        <div className="header-right">
          {results.length > 0 && (
            <button className="clear-btn" onClick={onClear}>
              <Trash2 size={16} />
              清空
            </button>
          )}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="results-container"
        onScroll={handleScroll}
      >
        {results.length === 0 ? (
          <div className="empty-state">
            {isSearching ? (
              <>
                <div className="searching-animation">
                  <span /><span /><span />
                </div>
                <p>正在搜索磁力链接...</p>
              </>
            ) : (
              <>
                <div className="empty-icon">🔍</div>
                <p>输入关键词开始搜索</p>
              </>
            )}
          </div>
        ) : (
          results.map((result, index) => (
            <UltimateCard 
              key={`${result.infoHash || index}-${index}`}
              result={result}
              index={index}
              formatSize={formatSize}
            />
          ))
        )}
      </div>

      {results.length > 0 && (
        <div className="results-footer">
          <span>共找到 {results.length} 个结果</span>
        </div>
      )}
    </div>
  );
};

export default LiveResults;
