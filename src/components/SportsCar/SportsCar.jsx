/**
 * 跑车组件 - 极致炫酷的底部行驶效果
 * 包含多种跑车、粒子效果、速度线、霓虹光效
 */
import React, { useEffect, useRef, useState } from 'react';
import './SportsCar.css';

const SportsCar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [carType, setCarType] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    // 检测是否滚动到页面底部附近
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 跑车类型数组
  const cars = [
    { name: 'red', color: '#ef4444', glow: '#f87171' },
    { name: 'blue', color: '#3b82f6', glow: '#60a5fa' },
    { name: 'gold', color: '#f59e0b', glow: '#fbbf24' },
    { name: 'purple', color: '#8b5cf6', glow: '#a78bfa' },
  ];

  const currentCar = cars[carType];

  return (
    <div ref={containerRef} className="sports-car-section">
      {/* 道路背景 */}
      <div className="road-container">
        {/* 天空渐变 */}
        <div className="sky-gradient" />
        
        {/* 城市剪影 */}
        <div className="city-skyline">
          <div className="building b1" />
          <div className="building b2" />
          <div className="building b3" />
          <div className="building b4" />
          <div className="building b5" />
          <div className="building b6" />
          <div className="building b7" />
          <div className="building b8" />
          <div className="building b9" />
          <div className="building b10" />
        </div>

        {/* 道路 */}
        <div className="road">
          {/* 路面纹理 */}
          <div className="road-texture" />
          
          {/* 车道线 */}
          <div className="lane-lines">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="lane-line" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>

          {/* 路面反光 */}
          <div className="road-reflection" />
        </div>

        {/* 速度线 */}
        <div className={`speed-lines ${isVisible ? 'active' : ''}`}>
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="speed-line"
              style={{
                top: `${20 + Math.random() * 60}%`,
                animationDuration: `${0.3 + Math.random() * 0.5}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* 地面粒子 */}
        <div className={`ground-particles ${isVisible ? 'active' : ''}`}>
          {[...Array(30)].map((_, i) => (
            <div 
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${1 + Math.random() * 2}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* 跑车主体 */}
        <div className={`sports-car ${currentCar.name} ${isVisible ? 'driving' : ''}`}>
          {/* 车身光晕 */}
          <div className="car-glow" style={{ '--glow-color': currentCar.glow }} />
          
          {/* 底盘阴影 */}
          <div className="car-shadow" />
          
          {/* 车身 */}
          <div className="car-body">
            {/* 尾翼 */}
            <div className="spoiler">
              <div className="spoiler-leg left" />
              <div className="spoiler-leg right" />
              <div className="spoiler-wing" />
            </div>
            
            {/* 后车身 */}
            <div className="rear-section">
              {/* 引擎盖散热口 */}
              <div className="vents">
                <div className="vent" />
                <div className="vent" />
                <div className="vent" />
              </div>
            </div>
            
            {/* 驾驶舱 */}
            <div className="cockpit">
              <div className="windshield" />
              <div className="roof" />
              <div className="side-window left" />
              <div className="side-window right" />
            </div>
            
            {/* 前车身 */}
            <div className="front-section">
              {/* 大灯 */}
              <div className="headlight left">
                <div className="light-beam" />
                <div className="light-glow" />
              </div>
              <div className="headlight right">
                <div className="light-beam" />
                <div className="light-glow" />
              </div>
              
              {/* 进气格栅 */}
              <div className="grille">
                <div className="grille-line" />
                <div className="grille-line" />
                <div className="grille-line" />
              </div>
              
              {/* 前唇 */}
              <div className="front-lip" />
            </div>
            
            {/* 车身线条 */}
            <div className="body-line" />
            <div className="side-skirt" />
            
            {/* 品牌标志 */}
            <div className="logo">🏎️</div>
          </div>
          
          {/* 车轮 */}
          <div className="wheel rear-left">
            <div className="rim">
              <div className="spoke s1" />
              <div className="spoke s2" />
              <div className="spoke s3" />
              <div className="spoke s4" />
              <div className="spoke s5" />
              <div className="center-cap" />
            </div>
            <div className="tire" />
          </div>
          
          <div className="wheel rear-right">
            <div className="rim">
              <div className="spoke s1" />
              <div className="spoke s2" />
              <div className="spoke s3" />
              <div className="spoke s4" />
              <div className="spoke s5" />
              <div className="center-cap" />
            </div>
            <div className="tire" />
          </div>
          
          <div className="wheel front-left">
            <div className="rim">
              <div className="spoke s1" />
              <div className="spoke s2" />
              <div className="spoke s3" />
              <div className="spoke s4" />
              <div className="spoke s5" />
              <div className="center-cap" />
            </div>
            <div className="tire" />
          </div>
          
          <div className="wheel front-right">
            <div className="rim">
              <div className="spoke s1" />
              <div className="spoke s2" />
              <div className="spoke s3" />
              <div className="spoke s4" />
              <div className="spoke s5" />
              <div className="center-cap" />
            </div>
            <div className="tire" />
          </div>
          
          {/* 尾灯 */}
          <div className="taillight left">
            <div className="taillight-glow" />
          </div>
          <div className="taillight right">
            <div className="taillight-glow" />
          </div>
          
          {/* 排气管火焰 */}
          <div className={`exhaust-flame ${isVisible ? 'active' : ''}`}>
            <div className="flame f1" />
            <div className="flame f2" />
            <div className="flame f3" />
          </div>
          
          {/* 氮气加速效果 */}
          <div className={`nitro-boost ${isVisible ? 'active' : ''}`}>
            <div className="nitro-ring r1" />
            <div className="nitro-ring r2" />
            <div className="nitro-ring r3" />
          </div>
        </div>

        {/* 第二辆车 (远处) */}
        <div className={`sports-car car-2 ${isVisible ? 'driving' : ''}`}>
          <div className="car-body">
            <div className="cockpit" />
            <div className="headlight left"><div className="light-beam" /></div>
            <div className="headlight right"><div className="light-beam" /></div>
          </div>
          <div className="wheel rear-left"><div className="rim" /></div>
          <div className="wheel rear-right"><div className="rim" /></div>
          <div className="wheel front-left"><div className="rim" /></div>
          <div className="wheel front-right"><div className="rim" /></div>
        </div>

        {/* 霓虹文字 */}
        <div className="neon-text">
          <span className="neon-letter">S</span>
          <span className="neon-letter">P</span>
          <span className="neon-letter">E</span>
          <span className="neon-letter">E</span>
          <span className="neon-letter">D</span>
        </div>
      </div>

      {/* 切换车型按钮 */}
      <div className="car-selector">
        {cars.map((car, idx) => (
          <button
            key={car.name}
            className={`car-btn ${carType === idx ? 'active' : ''}`}
            style={{ '--car-color': car.color }}
            onClick={() => setCarType(idx)}
          >
            <div className="color-dot" />
          </button>
        ))}
      </div>

      {/* 版权信息 */}
      <div className="footer-credits">
        <p>Made with 💜 for 董露小朋友</p>
        <p className="sub">愿你的人生如跑车般精彩飞驰</p>
      </div>
    </div>
  );
};

export default SportsCar;

