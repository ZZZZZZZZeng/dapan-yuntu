import React, { useState, useEffect } from 'react';
import HeatMap from './components/HeatMap';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import StatusBar from './components/StatusBar';
import { fetchStocks } from './api/stockApi';
import { hotStockCodes } from './data/stockCodes';

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 获取股票数据
  const loadStocks = async () => {
    try {
      setLoading(true);
      const data = await fetchStocks(hotStockCodes);
      
      if (data.length === 0) {
        setError('未获取到股票数据，请刷新重试');
        return;
      }
      
      setStocks(data);
      setFilteredStocks(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('获取股票数据失败，请刷新重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadStocks();
  }, []);

  // 30 秒自动刷新
  useEffect(() => {
    if (stocks.length > 0) {
      const interval = setInterval(loadStocks, 30000);
      return () => clearInterval(interval);
    }
  }, [stocks]);

  // 搜索筛选
  const handleSearch = (term) => {
    if (!term.trim()) {
      setFilteredStocks(stocks);
      return;
    }
    
    const filtered = stocks.filter(stock => 
      stock.name.includes(term) || 
      stock.code.includes(term)
    );
    setFilteredStocks(filtered);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <Header stockCount={stocks.length} />
      <FilterBar onSearch={handleSearch} />
      <StatusBar stocks={filteredStocks} />
      
      {loading && stocks.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">加载中...</div>
        </div>
      )}
      
      {error && (
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <div className="text-red-400 text-xl">{error}</div>
          <button 
            onClick={loadStocks}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重新加载
          </button>
        </div>
      )}
      
      {!loading && !error && stocks.length > 0 && (
        <HeatMap stocks={filteredStocks} />
      )}
      
      {lastUpdate && (
        <div className="bg-gray-800 text-gray-400 text-xs p-2 text-center">
          最后更新: {lastUpdate.toLocaleString('zh-CN')} | 每 30 秒自动刷新
        </div>
      )}
    </div>
  );
}
