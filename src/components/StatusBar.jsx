import React from 'react';

export default function StatusBar({ stocks }) {
  const stats = {
    total: stocks.length,
    up: stocks.filter(s => s.change > 0).length,
    down: stocks.filter(s => s.change < 0).length,
    flat: stocks.filter(s => s.change === 0).length,
  };

  return (
    <div className="bg-gray-800 text-white p-3 shadow-md">
      <div className="container mx-auto flex justify-around text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">上涨:</span>
          <span className="text-red-500 font-bold">{stats.up}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">下跌:</span>
          <span className="text-green-500 font-bold">{stats.down}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">平盘:</span>
          <span className="text-yellow-500 font-bold">{stats.flat}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">总计:</span>
          <span className="text-blue-400 font-bold">{stats.total}</span>
        </div>
      </div>
    </div>
  );
}
