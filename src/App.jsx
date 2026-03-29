import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeatMap from './components/HeatMap';
import Footer from './components/Footer';
import IndexBar from './components/IndexBar';
import { fetchStockData, fetchIndexData, fetchStockKline } from './api/stockApi';
import { getAllStockCodes, stockList, sectors, indices, getStockSector } from './data/stockCodes';

function App() {
  // 数据状态
  const [stockData, setStockData] = useState([]);
  const [indexData, setIndexData] = useState({});
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 筛选状态
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('all'); // all/sh/sz/cy/kc
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filterRange, setFilterRange] = useState({ min: -10, max: 10 });
  
  // 复盘模式
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(-1);
  const [reviewTimePoints, setReviewTimePoints] = useState([]);
  
  // K线弹窗
  const [showKlineModal, setShowKlineModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [klineData, setKlineData] = useState([]);
  
  // 统计数据
  const [marketStats, setMarketStats] = useState({
    up: 0,
    flat: 0,
    down: 0,
    volume: 0,
    volumeDiff: 0,
  });
  
  // 自动刷新定时器
  const refreshIntervalRef = useRef(null);
  
  // 计算市场统计数据
  const calculateMarketStats = useCallback((data) => {
    let up = 0, flat = 0, down = 0, volume = 0;
    data.forEach(stock => {
      const change = stock.changePercent || 0;
      if (change > 0) up++;
      else if (change < 0) down++;
      else flat++;
      volume += stock.turnover || 0;
    });
    return { up, flat, down, volume: volume / 10000 }; // 转为万亿
  }, []);

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
      setMarketStats(calculateMarketStats(dataWithSector));
      
      // 保存复盘时间点（每个30分钟存一次）
      const now = new Date();
      const timeKey = `${now.getHours().toString().padStart(2, '0')}:${Math.floor(now.getMinutes() / 30) * 30}`;
      if (!reviewTimePoints.includes(timeKey) && !isReviewMode) {
        setReviewTimePoints(prev => [...prev, timeKey]);
        setReviewHistory(prev => [...prev, { time: now, data: dataWithSector }]);
      }
    } catch (error) {
      console.error('获取股票数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isReviewMode, reviewTimePoints, calculateMarketStats]);

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
    
    // 按市场筛选
    switch(selectedMarket) {
      case 'sh': // 上证A股
        filtered = filtered.filter(stock => stock.code.startsWith('sh'));
        break;
      case 'sz': // 深证A股
        filtered = filtered.filter(stock => stock.code.startsWith('sz00'));
        break;
      case 'cy': // 创业板
        filtered = filtered.filter(stock => stock.code.startsWith('sz30'));
        break;
      case 'kc': // 科创板
        filtered = filtered.filter(stock => stock.code.startsWith('sh688'));
        break;
    }
    
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
  }, [stockData, selectedSectors, selectedIndex, filterRange, selectedMarket]);

  // 双击股票显示K线
  const handleStockDoubleClick = useCallback(async (stock) => {
    setSelectedStock(stock);
    setShowKlineModal(true);
    try {
      const data = await fetchStockKline(stock.code);
      setKlineData(data);
    } catch (error) {
      console.error('获取K线数据失败:', error);
    }
  }, []);

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
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* 顶部指数栏 */}
      <IndexBar indexData={indexData} lastUpdateTime={lastUpdateTime} />
      
      {/* 主体内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧边栏 */}
        <Sidebar
          selectedSectors={selectedSectors}
          onSectorChange={setSelectedSectors}
          selectedMarket={selectedMarket}
          onMarketChange={setSelectedMarket}
          selectedIndex={selectedIndex}
          onIndexChange={setSelectedIndex}
          filterRange={filterRange}
          onFilterChange={setFilterRange}
          marketStats={marketStats}
          onScreenshot={handleScreenshot}
          stockData={stockData}
        />
        
        {/* 热力图主区域 */}
        <div id="heatmap-container" className="flex-1 relative bg-[#0a0e17]">
          {/* 加载状态 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-50">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">正在加载市场数据...</p>
              </div>
            </div>
          )}
          
          <HeatMap
            stockData={filteredData}
            selectedSectors={selectedSectors}
            selectedIndex={selectedIndex}
            filterRange={filterRange}
            onStockClick={(stock) => console.log('点击股票:', stock)}
            onDrillDown={handleStockDoubleClick}
            isReviewMode={isReviewMode}
          />
        </div>
      </div>
      
      {/* 底部栏 */}
      <Footer
        reviewTimePoints={reviewTimePoints}
        currentReviewIndex={currentReviewIndex}
        onReviewTimeChange={(index) => {
          setCurrentReviewIndex(index);
          setStockData(reviewHistory[index].data);
          setIsReviewMode(true);
        }}
        onExitReview={() => {
          setIsReviewMode(false);
          setCurrentReviewIndex(-1);
          fetchAllStockData();
        }}
        isReviewMode={isReviewMode}
      />
      
      {/* K线弹窗 */}
      {showKlineModal && selectedStock && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowKlineModal(false)}>
          <div className="bg-gray-800 rounded-lg p-4 w-4/5 max-w-3xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedStock.stockName} ({selectedStock.code})</h3>
              <button 
                className="text-gray-400 hover:text-white" 
                onClick={() => setShowKlineModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="h-80 bg-gray-900 rounded flex items-center justify-center">
              <p className="text-gray-400">K线图功能开发中...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
