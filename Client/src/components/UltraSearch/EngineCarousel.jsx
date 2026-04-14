/**
 * 引擎轮播组件 - Vercel 版
 */
import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Zap, Shield, Globe, Clock } from 'lucide-react';
import './EngineCarousel.css';

const TIER_CONFIG = {
  tier1: { label: '官方API', color: '#10b981', icon: Shield },
  tier2: { label: 'RSS/API', color: '#3b82f6', icon: Zap },
  tier3: { label: '智能爬虫', color: '#f59e0b', icon: Globe },
  tier4: { label: '备用源', color: '#6b7280', icon: Clock },
};

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

export const EngineCarousel = ({ selected, onSelect }) => {
  const [engines, setEngines] = useState([]);
  const [activeTier, setActiveTier] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/engines`)
      .then(r => r.json())
      .then(data => {
        setEngines(data.engines || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredEngines = activeTier === 'all' 
    ? engines 
    : engines.filter(e => e.tier === activeTier);

  const toggleEngine = (engineName) => {
    onSelect(prev => 
      prev.includes(engineName)
        ? prev.filter(n => n !== engineName)
        : [...prev, engineName]
    );
  };

  if (loading) {
    return <div className="engines-loading">加载引擎...</div>;
  }

  return (
    <div className="engine-carousel">
      <div className="tier-tabs">
        <button 
          className={`tier-tab ${activeTier === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTier('all')}
        >
          全部引擎
        </button>
        {Object.entries(TIER_CONFIG).map(([tier, config]) => (
          <button
            key={tier}
            className={`tier-tab ${activeTier === tier ? 'active' : ''}`}
            style={{ '--tier-color': config.color }}
            onClick={() => setActiveTier(tier)}
          >
            <config.icon className="tab-icon" size={14} />
            {config.label}
          </button>
        ))}
      </div>

      <div className="engines-grid">
        {filteredEngines.map(engine => {
          const isSelected = selected.includes(engine.name);
          const tierConfig = TIER_CONFIG[engine.tier] || TIER_CONFIG.tier4;

          return (
            <div
              key={engine.name}
              className={`engine-card ${isSelected ? 'selected' : ''}`}
              style={{ '--engine-color': tierConfig.color }}
              onClick={() => toggleEngine(engine.name)}
            >
              <div className="engine-header">
                <span className="engine-tier-badge" style={{ background: tierConfig.color }}>
                  {tierConfig.label}
                </span>
                {isSelected && <Check className="selected-check" size={16} />}
              </div>
              
              <h4 className="engine-name">{engine.name}</h4>
              <p className="engine-desc">{engine.description}</p>
            </div>
          );
        })}
      </div>

      <div className="carousel-actions">
        <button className="action-btn" onClick={() => onSelect([])}>
          清除选择
        </button>
        <button className="action-btn primary" onClick={() => onSelect(engines.map(e => e.name))}>
          全选所有
        </button>
      </div>
    </div>
  );
};
