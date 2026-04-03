import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';
// 懒加载html2canvas，仅在需要截图时加载
const html2canvas = lazy(() => import('html2canvas'));
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
  const lastValidStockData = useRef([]); // 【关键优化】缓存上一次的有效股票数据，API异常时直接返回，绝不为空
  const [indexData, setIndexData] = useState({});
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // 仅标记刷新状态，不清除旧数据
  
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
    if (isReviewMode) return; // 复盘模式不刷新
    setIsRefreshing(true);
    try {
      // 获取所有股票代码
      const allCodes = getAllStockCodes();
      
      // 分批获取数据
      const data = await fetchStockData(allCodes);
      
      // 彻底过滤所有非个股内容：指数、ETF、基金、策略类全部移除
      const onlyStocks = data.filter(stock => {
        const code = stock.code || '';
        // 过滤规则：
        // 1. 指数：sh000、sz399开头
        // 2. ETF/基金：sh50、sh159、sh510、sh511、sh512、sh513、sh515、sh516、sh588、sz159开头
        // 3. 只保留纯个股：sh60/688、sz00/30开头的正常股票
        const isIndex = code.startsWith('sh000') || code.startsWith('sz399');
        const isETF = /^(sh|sz)(50|159|510|511|512|513|515|516|588)/.test(code);
        const isStock = /^(sh60|sh68|sz00|sz30)/.test(code);
        
        return isStock && !isIndex && !isETF;
      });
      
      // 为每个股票添加行业信息，放宽过滤条件，避免有效股票被过滤
      const dataWithSector = onlyStocks
        .filter(stock => stock && stock.code && stock.stockName) // 只要有代码和名称就算有效股票
        .map(stock => {
          const sectorInfo = getStockSector(stock.code);
          return {
            ...stock,
            // 如果市值为空，给一个默认值，避免被过滤
            circulationMarket: stock.circulationMarket || stock.totalMarket || 1000000000, // 默认1亿市值
            totalMarket: stock.totalMarket || stock.circulationMarket || 1000000000,
            sector: sectorInfo.code,
            sectorName: sectorInfo.name,
            sectorColor: sectorInfo.color,
          };
        });
      
      // 新数据准备完成后才替换，没有空白期
      if (dataWithSector && dataWithSector.length > 0) {
        // 新数据有效，更新缓存和状态
        lastValidStockData.current = dataWithSector;
        setStockData(dataWithSector);
        setLastUpdateTime(new Date());
        setMarketStats(calculateMarketStats(dataWithSector));
      } else {
        // 新数据无效，保留上一次的有效数据，不更新，完全避免黑屏
        console.warn('新数据为空，保留上一次有效数据');
      }
      
      // 保存复盘时间点（每个30分钟存一次）
      const now = new Date();
      const timeKey = `${now.getHours().toString().padStart(2, '0')}:${Math.floor(now.getMinutes() / 30) * 30}`;
      if (!reviewTimePoints.includes(timeKey)) {
        setReviewTimePoints(prev => [...prev, timeKey]);
        setReviewHistory(prev => [...prev, { time: now, data: dataWithSector }]);
      }
    } catch (error) {
      console.error('获取股票数据失败:', error);
    } finally {
      setIsRefreshing(false);
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

  // 全屏切换功能
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('进入全屏失败:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error('退出全屏失败:', err);
      });
    }
  }, []);

  // 初始化数据 - 只执行一次
  useEffect(() => {
    fetchAllStockData();
    fetchAllIndexData();
  }, []);

  // 自动刷新：只创建一次定时器，避免重复创建
  useEffect(() => {
    // 确保永远只有一个定时器在运行
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    if (!isReviewMode) { // 复盘模式下停止自动刷新
      refreshIntervalRef.current = setInterval(() => {
        fetchAllStockData();
        fetchAllIndexData();
      }, 30000); // 30秒刷新，降低频率避免闪烁
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isReviewMode]); // 只依赖复盘模式，不会重复创建定时器

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

      // 动态加载html2canvas
      const { default: html2canvas } = await import('html2canvas');
      
      // 生成截图
      const canvas = await html2canvas(container, {
        backgroundColor: '#0f172a',
        scale: 2, // 高清截图
        useCORS: true,
        logging: false, // 关闭日志输出
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
      <IndexBar 
        indexData={indexData} 
        lastUpdateTime={lastUpdateTime} 
        isRefreshing={isRefreshing}
        onRefresh={fetchAllStockData}
        onToggleFullscreen={handleToggleFullscreen}
      />
      
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
        
        {/* 热力图主区域，固定背景色和图表一致，避免更新时闪烁黑屏 */}
        <div id="heatmap-container" className="flex-1 relative bg-[#0a0e17] overflow-hidden">
          <HeatMap
            data={filteredData}
            loading={isRefreshing}
            isPaused={isReviewMode}
            changePercentRange={filterRange}
            onStockClick={(stockCode) => {
              const stock = stockData.find(s => s.code === stockCode);
              if (stock) {
                setSelectedStock(stock);
                setShowKlineModal(true);
              }
            }}
            lastUpdateTime={lastUpdateTime}
            selectedIndustry={selectedSectors}
            selectedMarket={selectedMarket}
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
