import React, { useState } from 'react';
import { Magnet, Copy, Check, ExternalLink, Users, HardDrive } from 'lucide-react';
import './UltimateCard.css';

const UltimateCard = ({ result, index, formatSize }) => {
  const [copied, setCopied] = useState(false);

  const {
    name,
    magnet,
    seeders = 0,
    leechers = 0,
    size = 0,
    uploaded,
    verified = false,
    _meta = {}
  } = result;

  const copyMagnet = async () => {
    try {
      await navigator.clipboard.writeText(magnet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const openMagnet = () => {
    window.location.href = magnet;
  };

  const getHealthScore = () => {
    if (seeders > 100) return { score: 100, label: '极佳', color: '#10b981' };
    if (seeders > 50) return { score: 80, label: '良好', color: '#22c55e' };
    if (seeders > 10) return { score: 60, label: '一般', color: '#f59e0b' };
    if (seeders > 0) return { score: 40, label: '较差', color: '#f97316' };
    return { score: 20, label: '死种', color: '#ef4444' };
  };

  const health = getHealthScore();

  return (
    <div className="ultimate-card">
      <div className="card-rank">{index + 1}</div>

      <div className="card-main">
        <div className="card-header">
          <h4 className="card-title" title={name}>{name}</h4>
          <div className="card-badges">
            {verified && <span className="badge verified">✓ 验证</span>}
            <span className="badge health" style={{ background: health.color }}>
              {health.label}
            </span>
            <span className="badge engine">{_meta.engine}</span>
          </div>
        </div>

        <div className="card-info">
          <span className="info-item">
            <HardDrive size={14} />
            {formatSize(size)}
          </span>
          <span className="info-item">
            <Users size={14} className="seeder-icon" />
            <span className="seeders">{seeders}</span>
            / <span className="leechers">{leechers}</span>
          </span>
          <span className="info-item">{uploaded || 'Unknown'}</span>
        </div>

        <div className="magnet-preview">
          <code>{magnet.substring(0, 60)}...</code>
        </div>
      </div>

      <div className="card-actions">
        <button className="action-btn primary" onClick={openMagnet}>
          <Magnet size={18} />
          下载
        </button>
        
        <button className={`action-btn ${copied ? 'success' : ''}`} onClick={copyMagnet}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
    </div>
  );
};

export default UltimateCard;
