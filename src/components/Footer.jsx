import React, { useState, useEffect } from 'react';

const Footer = ({ 
  onFilterChange, 
  activeFilter, 
  onReviewMode, 
  isReviewMode,
  currentTime,
  onScreenshot
}) => {
  // 涨跌幅过滤按钮
  const filterButtons = [
    { label: '-7%', min: -100, max: -7, color: 'bg-green-800' },
    { label: '-5%', min: -7, max: -5, color: 'bg-green-700' },
    { label: '-3%', min: -5, max: -3, color: 'bg-green-600' },
    { label: '-1%', min: -3, max: -1, color: 'bg-green-500' },
    { label: '0%', min: -1, max: 1, color: 'bg-gray-600' },
    { label: '+1%', min: 1, max: 3, color: 'bg-red-500' },
    { label: '+3%', min: 3, max: 5, color: 'bg-red-600' },
    { label: '+5%', min: 5, max: 7, color: 'bg-red-700' },
    { label: '+7%', min: 7, max: 100, color: 'bg-red-800' },
  ];

  // 键盘事件处理（复盘模式）
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isReviewMode) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          onReviewMode('prev');
          break;
        case 'ArrowRight':
          onReviewMode('next');
          break;
        case 'Escape':
          onReviewMode('exit');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReviewMode, onReviewMode]);

  // 时间显示格式化
  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* 左侧：涨跌幅过滤按钮 */}
        <div className="flex items-center space-x-1">
          <span className="text-gray-500 text-xs mr-2">涨跌幅筛选:</span>
          {filterButtons.map((btn, index) => (
            <button
              key={index}
              onClick={() => {
                if (activeFilter && activeFilter.min === btn.min && activeFilter.max === btn.max) {
                  onFilterChange(null);
                } else {
                  onFilterChange({ min: btn.min, max: btn.max });
                }
              }}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                activeFilter && activeFilter.min === btn.min && activeFilter.max === btn.max
                  ? `${btn.color} text-white ring-2 ring-white/50`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* 中间：复盘模式和截图 */}
        <div className="flex items-center space-x-3">
          {/* 复盘模式 */}
          <button
            onClick={() => onReviewMode?.(isReviewMode ? 'exit' : 'start')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isReviewMode
                ? 'bg-yellow-600/30 text-yellow-400 border border-yellow-500/50'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-transparent'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{isReviewMode ? '退出复盘' : '复盘模式'}</span>
          </button>

          {/* 截图按钮 */}
          <button
            onClick={onScreenshot}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">截图</span>
          </button>
        </div>

        {/* 右侧：时间显示 */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-gray-500">当前时间</div>
            <div className="text-lg font-mono text-gray-300">
              {formatTime(currentTime)}
            </div>
          </div>
          
          {/* 市场状态指示 */}
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" title="交易中" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
