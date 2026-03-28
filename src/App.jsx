import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeatMap from './components/HeatMap';
import Footer from './components/Footer';
import { fetchStockData, fetchIndexData } from './api/stockApi';
import { getAllStockCodes, stockList, sectors, indices } from './data/stockCodes';

function App() {
  // 数据状态
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [indexData, setIndexData] = useState({});
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 筛选状态
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filterRange, setFilterRange] = useState(null);
  
  // 复盘模式
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(-1);
  
  // 自动刷新定时器
  const refreshIntervalRef = useRef(null);
  
  // 获取股票数据
  const fetchAllStockData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 获取所有股票代码
      const allCodes = getAllStockCodes();
      
      // 分批获取数据
      const data = await fetchStockData(allCodes);
      
      // 为每个股票添加行业信息
      const dataWithSector = data.map(stock => {
        const sectorInfo = getStockSector(stock.code);
        return {
          ...stock,
          sector: sectorInfo.code,
          sectorName: sectorInfo.name,
          sectorColor: sectorInfo.color,
        };
      });
      
      setStockData(dataWithSector);
      setLastUpdateTime(new Date());
      
      // 如果是复盘模式，保存历史数据
      if (isReviewMode) {
        setReviewHistory(prev => [...prev, { time: new Date(), data: dataWithSector }]);
      }
    } catch (error) {
      console.error('获取股票数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isReviewMode]);

  // 获取指数数据
  const fetchAllIndexData = useCallback(async () => {
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
    }
  }, []);

  // 过滤数据
  useEffect(() => {
    let filtered = [...stockData];
    
    // 按行业筛选
    if (selectedSectors.length > 0) {
      filtered = filtered.filter(stock => selectedSectors.includes(stock.sector));
    }
    
    // 按指数筛选（这里简化处理，实际应该根据指数成分股）
    if (selectedIndex) {
      // 可以在这里添加指数成分股过滤逻辑
    }
    
    // 按涨跌幅范围筛选
    if (filterRange) {
      filtered = filtered.filter(stock => {
        const changePercent = stock.changePercent || 0;
        return changePercent >= filterRange.min && changePercent <= filterRange.max;
      });
    }
    
    setFilteredData(filtered);
  }, [stockData, selectedSectors, selectedIndex, filterRange]);

  // 初始化数据
  useEffect(() => {
    fetchAllStockData();
    fetchAllIndexData();
  }, [fetchAllStockData, fetchAllIndexData]);

  // 自动刷新
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      fetchAllStockData();
      fetchAllIndexData();
    }, 8000); // 8秒刷新

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchAllStockData, fetchAllIndexData]);

  // 处理复盘模式
  const handleReviewMode = (action) => {
    switch (action) {
      case 'start':
        setIsReviewMode(true);
        setReviewHistory([{ time: new Date(), data: stockData }]);
        setCurrentReviewIndex(0);
        break;
      case 'exit':
        setIsReviewMode(false);
        setReviewHistory([]);
        setCurrentReviewIndex(-1);
        break;
      case 'prev':
        if (currentReviewIndex > 0) {
          setCurrentReviewIndex(currentReviewIndex - 1);
          setStockData(reviewHistory[currentReviewIndex - 1].data);
        }
        break;
      case 'next':
        if (currentReviewIndex < reviewHistory.length - 1) {
          setCurrentReviewIndex(currentReviewIndex + 1);
          setStockData(reviewHistory[currentReviewIndex + 1].data);
        }
        break;
    }
  };

  // 截图功能
  const handleScreenshot = () => {
    // 这里可以实现截图功能
    // 可以使用 html2canvas 库来实现
    alert('截图功能即将上线');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* 顶部导航 */}
      <Header 
        onRefresh={fetchAllStockData}
        lastUpdateTime={lastUpdateTime}
      />
      
      {/* 主体内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧边栏 */}
        <Sidebar
          selectedSectors={selectedSectors}
          onSectorChange={setSelectedSectors}
          selectedIndex={selectedIndex}
          onIndexChange={setSelectedIndex}
          stockData={stockData}
        />
        
        {/* 热力图主区域 */}
        <div className="flex-1 relative">
          <HeatMap
            stockData={filteredData}
            selectedSectors={selectedSectors}
            selectedIndex={selectedIndex}
            filterRange={filterRange}
            onStockClick={(stock) => console.log('点击股票:', stock)}
            onDrillDown={(stock) => console.log('双击股票:', stock)}
            isReviewMode={isReviewMode}
          />
        </div>
      </div>
      
      {/* 底部栏 */}
      <Footer
        onFilterChange={setFilterRange}
        activeFilter={filterRange}
        onReviewMode={handleReviewMode}
        isReviewMode={isReviewMode}
        currentTime={lastUpdateTime}
        onScreenshot={handleScreenshot}
      />
    </div>
  );
}

export default App;
