import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeatMap from './components/HeatMap';
import Footer from './components/Footer';
import { fetchStockData, fetchIndexData } from './api/stockApi';
import { getAllStockCodes, stockList, sectors, indices, getStockSector } from './data/stockCodes';

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

  // 过滤数据 - 使用useMemo缓存结果，避免重复计算
  const filteredData = useMemo(() => {
    let filtered = [...stockData];
    
    // 按行业筛选
    if (selectedSectors.length > 0) {
      filtered = filtered.filter(stock => selectedSectors.includes(stock.sector));
    }
    
    // 按指数筛选（简化版本：按代码前缀分类，后续可接入真实成分股数据）
    if (selectedIndex) {
      // 提前排序大市值，避免重复排序
      const sortedByMarketCap = [...filtered].sort((a,b) => (b.totalMarket || 0) - (a.totalMarket || 0));
      
      filtered = filtered.filter(stock => {
        switch(selectedIndex) {
          case 'sh000001': // 上证指数：60/688开头
            return stock.code.startsWith('sh60') || stock.code.startsWith('sh688');
          case 'sz399001': // 深证成指：00/30开头
            return stock.code.startsWith('sz00') || stock.code.startsWith('sz30');
          case 'sz399006': // 创业板指：30开头
            return stock.code.startsWith('sz30');
          case 'sh000688': // 科创50：688开头
            return stock.code.startsWith('sh688');
          case 'sh000016': // 上证50：暂时筛选头部50只大市值
            return sortedByMarketCap.slice(0,50).some(s => s.code === stock.code);
          case 'sh000300': // 沪深300：暂时筛选头部300只大市值
            return sortedByMarketCap.slice(0,300).some(s => s.code === stock.code);
          default:
            return true;
        }
      });
    }
    
    // 按涨跌幅范围筛选
    if (filterRange) {
      filtered = filtered.filter(stock => {
        const changePercent = stock.changePercent || 0;
        return changePercent >= filterRange.min && changePercent <= filterRange.max;
      });
    }
    
    return filtered;
  }, [stockData, selectedSectors, selectedIndex, filterRange]);

  // 初始化数据
  useEffect(() => {
    fetchAllStockData();
    fetchAllIndexData();
  }, [fetchAllStockData, fetchAllIndexData]);

  // 自动刷新
  useEffect(() => {
    if (!isReviewMode) { // 复盘模式下停止自动刷新
      refreshIntervalRef.current = setInterval(() => {
        fetchAllStockData();
        fetchAllIndexData();
      }, 8000); // 8秒刷新
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchAllStockData, fetchAllIndexData, isReviewMode]);

  // 复盘模式键盘导航
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isReviewMode) return;
      
      switch(e.key) {
        case 'ArrowLeft': // 左方向键：上一个历史
          handleReviewMode('prev');
          break;
        case 'ArrowRight': // 右方向键：下一个历史
          handleReviewMode('next');
          break;
        case 'Escape': // ESC键：退出复盘模式
          handleReviewMode('exit');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReviewMode, currentReviewIndex, reviewHistory]);

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
  const handleScreenshot = useCallback(async () => {
    try {
      // 获取主容器
      const container = document.getElementById('heatmap-container');
      if (!container) return;

      // 生成截图
      const canvas = await html2canvas(container, {
        backgroundColor: '#0f172a',
        scale: 2, // 高清截图
        useCORS: true,
      });

      // 转换为图片并下载
      const link = document.createElement('a');
      link.download = `大盘云图-${new Date().toLocaleString('zh-CN')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('截图失败:', error);
      alert('截图失败，请重试');
    }
  }, []);

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
        <div id="heatmap-container" className="flex-1 relative">
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
