import React, { useState } from 'react';
import { sectors, indices } from '../data/stockCodes';

const Sidebar = ({ 
  selectedSectors, 
  onSectorChange, 
  selectedIndex,
  onIndexChange,
  stockData,
  onFilterByChange,
}) => {
  const [activeTab, setActiveTab] = useState('sectors'); // sectors, indices, stats
  const [expandedSectors, setExpandedSectors] = useState({});

  // 切换行业展开/折叠
  const toggleSector = (sectorCode) => {
    setExpandedSectors(prev => ({
      ...prev,
      [sectorCode]: !prev[sectorCode]
    }));
  };

  // 全选/取消全选行业
  const toggleAllSectors = () => {
    const allSectorCodes = Object.keys(sectors);
    if (selectedSectors.length === allSectorCodes.length) {
      onSectorChange([]);
    } else {
      onSectorChange(allSectorCodes);
    }
  };

  // 计算行业统计数据
  const getSectorStats = () => {
    const stats = {};
    
    Object.entries(sectors).forEach(([code, info]) => {
      const sectorStocks = stockData.filter(s => {
        // 这里简化处理，实际应该根据股票真实行业判断
        return s.sector === code;
      });
      
      const avgChange = sectorStocks.length > 0 
        ? sectorStocks.reduce((sum, s) => sum + (s.changePercent || 0), 0) / sectorStocks.length 
        : 0;
      
      const upCount = sectorStocks.filter(s => (s.changePercent || 0) > 0).length;
      const downCount = sectorStocks.filter(s => (s.changePercent || 0) < 0).length;
      
      stats[code] = {
        ...info,
        avgChange,
        upCount,
        downCount,
        totalCount: sectorStocks.length,
      };
    });
    
    return stats;
  };

  const sectorStats = getSectorStats();

  // 渲染板块列表
  const renderSectorList = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={toggleAllSectors}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          {selectedSectors.length === Object.keys(sectors).length ? '取消全选' : '全选'}
        </button>
        <span className="text-xs text-gray-500">
          {selectedSectors.length}/{Object.keys(sectors).length}
        </span>
      </div>
      
      {Object.entries(sectors).map(([code, info]) => {
        const isSelected = selectedSectors.includes(code);
        const stats = sectorStats[code];
        
        return (
          <div key={code} className="group">
            <div
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-blue-600/30 border border-blue-500/50' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50 border border-transparent'
              }`}
              onClick={() => {
                if (isSelected) {
                  onSectorChange(selectedSectors.filter(s => s !== code));
                } else {
                  onSectorChange([...selectedSectors, code]);
                }
              }}
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: info.color }}
                />
                <span className="text-sm text-gray-200">{info.name}</span>
              </div>
              
              {stats && (
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-mono ${
                    stats.avgChange > 0 ? 'text-red-400' : 
                    stats.avgChange < 0 ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {stats.avgChange > 0 ? '+' : ''}{stats.avgChange.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // 渲染指数列表
  const renderIndexList = () => (
    <div className="space-y-2">
      {Object.entries(indices).map(([code, info]) => {
        const isSelected = selectedIndex === code;
        const indexData = null; // 这里可以从props传入指数数据
        
        return (
          <div
            key={code}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              isSelected 
                ? 'bg-blue-600/30 border border-blue-500/50' 
                : 'bg-gray-800/50 hover:bg-gray-700/50 border border-transparent'
            }`}
            onClick={() => onIndexChange?.(isSelected ? null : code)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-200">{info.name}</div>
                <div className="text-xs text-gray-500">{code}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-gray-300">--</div>
                <div className="text-xs text-gray-500">--</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // 渲染统计面板
  const renderStatsPanel = () => {
    const totalStocks = stockData?.length || 0;
    const upStocks = stockData?.filter(s => (s.changePercent || 0) > 0).length || 0;
    const downStocks = stockData?.filter(s => (s.changePercent || 0) < 0).length || 0;
    const flatStocks = totalStocks - upStocks - downStocks;
    
    const upRatio = totalStocks > 0 ? (upStocks / totalStocks * 100).toFixed(1) : 0;
    const downRatio = totalStocks > 0 ? (downStocks / totalStocks * 100).toFixed(1) : 0;
    
    return (
      <div className="space-y-4">
        {/* 涨跌家数统计 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">涨跌分布</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-400">上涨</span>
              <span className="text-sm font-mono text-red-400">{upStocks} ({upRatio}%)</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${upRatio}%` }} />
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-green-400">下跌</span>
              <span className="text-sm font-mono text-green-400">{downStocks} ({downRatio}%)</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${downRatio}%` }} />
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">平盘</span>
              <span className="text-sm font-mono text-gray-400">{flatStocks}</span>
            </div>
          </div>
        </div>
        
        {/* 市场统计 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">市场概况</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-gray-700/50 rounded">
              <div className="text-lg font-mono text-gray-200">{totalStocks}</div>
              <div className="text-xs text-gray-500">股票总数</div>
            </div>
            <div className="text-center p-2 bg-gray-700/50 rounded">
              <div className="text-lg font-mono text-gray-200">--</div>
              <div className="text-xs text-gray-500">成交额(亿)</div>
            </div>
          </div>
        </div>
        
        {/* 涨跌幅分布 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">涨跌幅分布</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-red-600">+7%以上</span>
              <span className="text-gray-400">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-500">+5%~7%</span>
              <span className="text-gray-400">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-400">+3%~5%</span>
              <span className="text-gray-400">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-300">0~3%</span>
              <span className="text-gray-400">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-300">-0~3%</span>
              <span className="text-gray-400">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">-3%~5%</span>
              <span className="text-gray-400">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-500">-5%~7%</span>
              <span className="text-gray-400">--</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">-7%以下</span>
              <span className="text-gray-400">--</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Tab切换 */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('sectors')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'sectors'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          板块
        </button>
        <button
          onClick={() => setActiveTab('indices')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'indices'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          指数
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'stats'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/10'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          统计
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'sectors' && renderSectorList()}
        {activeTab === 'indices' && renderIndexList()}
        {activeTab === 'stats' && renderStatsPanel()}
      </div>

      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <div className="text-xs text-gray-500 text-center">
          数据来源：腾讯财经 API
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
