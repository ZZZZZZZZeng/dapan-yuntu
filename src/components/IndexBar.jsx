import React from 'react';

const IndexBar = ({ indexData, lastUpdateTime }) => {
  // 核心指数列表
  const coreIndices = [
    { code: 'sh000001', name: '上证指数' },
    { code: 'sz399001', name: '深证成指' },
    { code: 'sz399006', name: '创业板指' },
    { code: 'sh000985', name: '中证全指' },
    { code: 'sh000016', name: '上证50' },
    { code: 'sh000300', name: '沪深300' },
    { code: 'sh000905', name: '中证500' },
  ];

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-700 py-1 px-4 flex items-center justify-between text-sm">
      <div className="flex items-center space-x-6">
        <div className="font-bold text-white mr-2">大盘云图</div>
        {coreIndices.map(index => {
          const data = indexData[index.code];
          const change = data?.changePercent || 0;
          const color = change > 0 ? 'text-red-400' : change < 0 ? 'text-green-400' : 'text-gray-300';
          const sign = change > 0 ? '+' : '';
          
          return (
            <div key={index.code} className="flex items-center space-x-1">
              <span className="text-gray-300">{index.name}</span>
              <span className="font-mono">{data?.price?.toFixed(2) || '--'}</span>
              <span className={`font-mono ${color}`}>{sign}{change?.toFixed(2) || '0.00'}%</span>
            </div>
          );
        })}
      </div>
      
      <div className="text-gray-400">
        {lastUpdateTime ? lastUpdateTime.toLocaleString('zh-CN') : ''}
      </div>
    </div>
  );
};

export default IndexBar;
