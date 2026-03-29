import React from 'react';
import { sectors } from '../data/stockCodes';

const Sidebar = ({ 
  selectedSectors, 
  onSectorChange, 
  selectedMarket, 
  onMarketChange,
  filterRange, 
  onFilterChange,
  marketStats,
  onScreenshot,
}) => {
  // 市场选项
  const marketOptions = [
    { value: 'all', name: 'A股全图' },
    { value: 'sh', name: '上证A股' },
    { value: 'sz', name: '深证A股' },
    { value: 'cy', name: '创业板' },
    { value: 'kc', name: '科创板' },
  ];

  // 涨跌幅选项
  const rangeOptions = [
    { value: { min: -10, max: 10 }, name: '全部' },
    { value: { min: 3, max: 10 }, name: '>3%' },
    { value: { min: 0, max: 10 }, name: '上涨' },
    { value: { min: -10, max: 0 }, name: '下跌' },
    { value: { min: -10, max: -3 }, name: '<-3%' },
  ];

  // 全选/反选行业
  const handleSelectAll = () => {
    onSectorChange(Object.keys(sectors));
  };

  const handleSelectInverse = () => {
    const allSectors = Object.keys(sectors);
    const newSelected = allSectors.filter(s => !selectedSectors.includes(s));
    onSectorChange(newSelected);
  };

  const handleClearAll = () => {
    onSectorChange([]);
  };

  // 切换行业选中状态
  const toggleSector = (sectorCode) => {
    if (selectedSectors.includes(sectorCode)) {
      onSectorChange(selectedSectors.filter(s => s !== sectorCode));
    } else {
      onSectorChange([...selectedSectors, sectorCode]);
    }
  };

  const changeColor = (change) => {
    return change > 0 ? 'text-red-400' : change < 0 ? 'text-green-400' : 'text-gray-300';
  };

  return (
    <div className="w-56 bg-gray-800 border-r border-gray-700 flex flex-col overflow-y-auto text-sm">
      {/* 市场选择 */}
      <div className="p-2 border-b border-gray-700">
        {marketOptions.map(option => (
          <div 
            key={option.value}
            className={`py-1 px-2 rounded cursor-pointer mb-1 ${
              selectedMarket === option.value ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
            }`}
            onClick={() => onMarketChange(option.value)}
          >
            {option.name}
          </div>
        ))}
      </div>

      {/* 涨跌幅筛选 */}
      <div className="p-2 border-b border-gray-700">
        <div className="text-gray-400 mb-1">当日涨跌幅</div>
        <select 
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
          value={JSON.stringify(filterRange)}
          onChange={(e) => onFilterChange(JSON.parse(e.target.value))}
        >
          {rangeOptions.map((option, index) => (
            <option key={index} value={JSON.stringify(option.value)}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {/* 市场统计 */}
      <div className="p-2 border-b border-gray-700">
        <div className="grid grid-cols-2 gap-1 mb-2">
          <div className="text-center">
            <div className="text-red-400">上涨</div>
            <div className="font-mono">{marketStats.up || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">平盘</div>
            <div className="font-mono">{marketStats.flat || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-green-400">下跌</div>
            <div className="font-mono">{marketStats.down || 0}</div>
          </div>
        </div>
        <div className="text-center mb-1">
          <div className="text-gray-300">成交额</div>
          <div className="font-mono">{marketStats.volume?.toFixed(2) || 0}万亿</div>
        </div>
      </div>

      {/* 截图按钮 */}
      <div className="p-2 border-b border-gray-700">
        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-1 flex items-center justify-center"
          onClick={onScreenshot}
        >
          📸 截图分享
        </button>
      </div>

      {/* 行业板块操作 */}
      <div className="p-2 border-b border-gray-700 flex gap-1">
        <button className="flex-1 bg-gray-700 hover:bg-gray-600 rounded py-1 text-xs" onClick={handleSelectAll}>全选</button>
        <button className="flex-1 bg-gray-700 hover:bg-gray-600 rounded py-1 text-xs" onClick={handleSelectInverse}>反选</button>
        <button className="flex-1 bg-gray-700 hover:bg-gray-600 rounded py-1 text-xs" onClick={handleClearAll}>清空</button>
      </div>

      {/* 行业列表 */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(sectors).map(([code, info]) => (
          <div 
            key={code}
            className={`py-1 px-2 rounded cursor-pointer mb-1 flex items-center justify-between ${
              selectedSectors.includes(code) ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
            }`}
            onClick={() => toggleSector(code)}
          >
            <span>{info.name}</span>
            {/* 可以添加行业涨跌幅 */}
          </div>
        ))}
      </div>

      {/* 操作提示 */}
      <div className="p-2 border-t border-gray-700 text-xs text-gray-400">
        <div className="font-bold mb-1">操作提示：</div>
        <div>· 面积代表流通市值</div>
        <div>· 颜色代表涨跌幅度</div>
        <div>· 每8秒更新数据</div>
        <div>· 双击色块查看K线</div>
        <div>· 按键盘方向键复盘</div>
      </div>
    </div>
  );
};

export default Sidebar;
