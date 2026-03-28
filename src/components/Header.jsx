import React, { useState, useEffect } from 'react';
import { fetchIndexData } from '../api/stockApi';
import { indices } from '../data/stockCodes';

const Header = ({ onRefresh, lastUpdateTime }) => {
  const [indexData, setIndexData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 获取指数数据
  const fetchIndices = async () => {
    setIsLoading(true);
    try {
      const indexCodes = Object.keys(indices);
      const data = await fetchIndexData(indexCodes);
      
      const indexMap = {};
      data.forEach(item => {
        indexMap[item.code] = item;
      });
      
      setIndexData(indexMap);
    } catch (error) {
      console.error('获取指数数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化涨跌幅显示
  const formatChange = (changePercent) => {
    if (changePercent === undefined || changePercent === null) return '--';
    const sign = changePercent > 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  // 获取涨跌幅颜色
  const getChangeColor = (changePercent) => {
    if (changePercent === undefined || changePercent === null) return 'text-gray-400';
    if (changePercent > 0) return 'text-red-500';
    if (changePercent < 0) return 'text-green-500';
    return 'text-gray-400';
  };

  // 初始化获取数据
  useEffect(() => {
    fetchIndices();
  }, []);

  // 定时刷新
  useEffect(() => {
    const interval = setInterval(() => {
      fetchIndices();
    }, 8000); // 8秒刷新一次

    return () => clearInterval(interval);
  }, []);

  // 主要指数
  const mainIndices = ['sh000001', 'sz399001', 'sz399006'];

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">大</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">大盘云图</h1>
            <p className="text-gray-500 text-xs">A股热力图</p>
          </div>
        </div>

        {/* 主要指数 */}
        <div className="flex items-center space-x-6">
          {mainIndices.map(code => {
            const data = indexData[code];
            const indexInfo = indices[code];
            if (!indexInfo) return null;
            
            return (
              <div key={code} className="text-center">
                <div className="text-gray-400 text-xs mb-1">{indexInfo.name}</div>
                <div className={`font-mono font-bold ${getChangeColor(data?.changePercent)}`}>
                  {data?.price ? data.price.toFixed(2) : '--'}
                </div>
                <div className={`text-xs ${getChangeColor(data?.changePercent)}`}>
                  {formatChange(data?.changePercent)}
                </div>
              </div>
            );
          })}
        </div>

        {/* 右侧操作区 */}
        <div className="flex items-center space-x-4">
          {/* 更新时间 */}
          <div className="text-right">
            <div className="text-gray-500 text-xs">更新时间</div>
            <div className="text-gray-300 text-sm font-mono">
              {lastUpdateTime ? new Date(lastUpdateTime).toLocaleTimeString('zh-CN') : '--:--:--'}
            </div>
          </div>

          {/* 刷新按钮 */}
          <button
            onClick={() => {
              fetchIndices();
              onRefresh?.();
            }}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              isLoading 
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
            title="刷新数据"
          >
            <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* 收藏按钮 */}
          <button
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            title="收藏"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
