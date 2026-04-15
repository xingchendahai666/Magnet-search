/**
 * 信封下拉组件 - 极致精美的信封打开动画
 * 下拉页面时信封从顶部滑入，继续下拉信封打开显示祝福
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EnvelopePull.css';

const EnvelopePull = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isOpened, setIsOpened] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const lastScrollRef = useRef(0);

  // 使用 requestAnimationFrame 优化滚动性能
  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    
    rafRef.current = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // 计算滚动进度 (0-200%)
      // 0-50%: 信封滑入
      // 50-100%: 信封打开
      // 100%+: 保持打开状态
      const progress = Math.min(scrollY / (windowHeight * 0.6), 2);
      setScrollProgress(progress);
      
      // 触发打开状态
      if (progress >= 0.5 && !isOpened) {
        setIsOpened(true);
        setTimeout(() => setShowSparkles(true), 300);
      } else if (progress < 0.3 && isOpened) {
        setIsOpened(false);
        setShowSparkles(false);
      }
      
      rafRef.current = null;
    });
  }, [isOpened]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  // 计算动画值
  const envelopeY = Math.max(-100, 100 - scrollProgress * 200); // 从上方滑入
  const envelopeRotate = scrollProgress * 5; // 轻微旋转
  const flapRotate = isOpened ? 180 : 0; // 信封盖翻转
  const letterY = isOpened ? -60 : 0; // 信纸升起
  const letterScale = isOpened ? 1.05 : 1;
  const opacity = Math.min(scrollProgress * 2, 1);

  return (
    <div 
      ref={containerRef}
      className="envelope-section"
      style={{ opacity }}
    >
      {/* 背景粒子效果 */}
      <div className="envelope-bg">
        <div className="floating-hearts">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`heart heart-${i + 1}`}>💝</div>
          ))}
        </div>
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
      </div>

      {/* 信封容器 */}
      <div 
        className="envelope-wrapper"
        style={{
          transform: `translateY(${envelopeY}%) rotate(${envelopeRotate}deg)`,
        }}
      >
        {/* 信封主体 */}
        <div className={`envelope ${isOpened ? 'opened' : ''}`}>
          {/* 信封背面 */}
          <div className="envelope-back">
            <div className="paper-texture" />
          </div>

          {/* 信纸 (祝福内容) */}
          <div 
            className="letter"
            style={{
              transform: `translateY(${letterY}%) scale(${letterScale})`,
            }}
          >
            <div className="letter-paper">
              {/* 信纸装饰边框 */}
              <div className="letter-border">
                <div className="corner corner-tl" />
                <div className="corner corner-tr" />
                <div className="corner corner-bl" />
                <div className="corner corner-br" />
              </div>
              
              {/* 祝福文字 */}
              <div className="blessing-content">
                <div className="wax-seal">💌</div>
                <p className="blessing-line line-1">
                  <span className="to-label">To</span>
                  <span className="highlight-name">董露小朋友</span>
                  <span className="comma">，</span>
                </p>
                <p className="blessing-line line-2">
                  <span className="wish-text">天天开心</span>
                </p>
                <div className="decoration-divider">
                  <span>✦</span>
                  <div className="line" />
                  <span>✦</span>
                </div>
                <p className="signature">— 愿你被世界温柔以待</p>
              </div>

              {/* 信纸纹理 */}
              <div className="paper-lines" />
            </div>
          </div>

          {/* 信封前面 */}
          <div className="envelope-front">
            <div className="envelope-pocket" />
            
            {/* 信封盖 (可翻转) */}
            <div 
              className="envelope-flap"
              style={{
                transform: `rotateX(${flapRotate}deg)`,
              }}
            >
              <div className="flap-inner">
                <div className="wax-stamp">
                  <div className="stamp-outer">
                    <div className="stamp-inner">
                      <span className="stamp-icon">🌸</span>
                    </div>
                  </div>
                </div>
                <div className="flap-triangle" />
              </div>
            </div>
          </div>

          {/* 信封侧面阴影 */}
          <div className="envelope-shadow" />
        </div>

        {/* 打开后的闪光效果 */}
        {showSparkles && (
          <div className="sparkles-container">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className={`sparkle sparkle-${i + 1}`}
                style={{
                  animationDelay: `${i * 0.1}s`
                }}
              >
                {['✨', '⭐', '💫', '🌟'][i % 4]}
              </div>
            ))}
          </div>
        )}

        {/* 提示文字 */}
        <div className={`pull-hint ${isOpened ? 'fade-out' : ''}`}>
          <div className="hint-arrow">↓</div>
          <span>继续下拉打开信封</span>
        </div>
      </div>

      {/* 底部渐变过渡 */}
      <div className="section-transition" />
    </div>
  );
};

export default EnvelopePull;
