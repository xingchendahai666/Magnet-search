import React, { useEffect, useState } from 'react';
import EnvelopePull from './components/EnvelopePull/EnvelopePull';
import { ParallelSearch } from './components/UltraSearch/ParallelSearch';
import SportsCar from './components/SportsCar/SportsCar';
import { AuroraUI } from './components/Visuals/AuroraUI';
import './App.css';

function App() {
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    // 3秒后隐藏提示
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      <AuroraUI />
      
      {/* 滚动提示 */}
      {showHint && (
        <div className="scroll-hint-overlay">
          <div className="scroll-mouse">
            <div className="mouse-wheel" />
          </div>
          <p>向下滚动查看惊喜</p>
        </div>
      )}

      {/* 信封区域 - 第一屏 */}
      <section className="section envelope-section">
        <EnvelopePull />
      </section>

      {/* 搜索区域 - 第二屏 */}
      <section className="section search-section">
        <div className="section-divider">
          <div className="divider-line" />
          <span className="divider-text">✦ 开始探索 ✦</span>
          <div className="divider-line" />
        </div>
        <ParallelSearch />
      </section>

      {/* 跑车区域 - 底部 */}
      <section className="section car-section">
        <SportsCar />
      </section>
    </div>
  );
}

export default App;

