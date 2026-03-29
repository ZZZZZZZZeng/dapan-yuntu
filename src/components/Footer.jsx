import React from 'react';

const Footer = ({ 
  reviewTimePoints, 
  currentReviewIndex, 
  onReviewTimeChange,
  onExitReview,
  isReviewMode 
}) => {
  // 生成默认的交易时间点
  const defaultTimePoints = [
    '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:30', '14:00', '14:30', '15:00'
  ];

  const timePoints = reviewTimePoints.length > 0 ? reviewTimePoints : defaultTimePoints;

  // 颜色阶配置，和涨跌幅颜色映射完全对齐
  const colorStops = [
    { percent: '-4%', color: '#14532d' },
    { percent: '-3%', color: '#15803d' },
    { percent: '-2%', color: '#16a34a' },
    { percent: '-1%', color: '#86efac' },
    { percent: '0%', color: '#475569' },
    { percent: '+1%', color: '#fca5a5' },
    { percent: '+2%', color: '#dc2626' },
    { percent: '+3%', color: '#991b1b' },
    { percent: '+4%', color: '#7f1d1d' },
  ];

  return (
    <div className="bg-gray-800 border-t border-gray-700 py-2 px-4 flex items-center justify-between text-sm">
      {/* 复盘时间点 */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-400 mr-2">当日复盘：</span>
        {timePoints.map((time, index) => (
          <button
            key={index}
            className={`px-2 py-1 rounded text-xs ${
              currentReviewIndex === index 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            onClick={() => onReviewTimeChange(index)}
          >
            {time}
          </button>
        ))}
        {isReviewMode && (
          <button 
            className="ml-2 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white"
            onClick={onExitReview}
          >
            退出复盘
          </button>
        )}
      </div>

      {/* 颜色阶 */}
      <div className="flex items-center space-x-2">
        {colorStops.map((stop, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-6 h-4" 
              style={{ backgroundColor: stop.color }}
            ></div>
            <span className="text-xs text-gray-400 ml-1">{stop.percent}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Footer;
