import React, { useState, useEffect, useCallback, useRef, lazy } from 'react';
const html2canvas = lazy(() => import('html2canvas'));
import HeatMap from './components/HeatMap';
import { fetchStockData, fetchIndexData } from './api/stockApi';
import { getAllStockCodes, sectors, indices, getStockSector } from './data/stockCodes';

// 判断是否交易时段
function isTradingTime() {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const time = now.getHours() * 60 + now.getMinutes();
  return (time >= 570 && time <= 690) || (time >= 780 && time <= 900);
}

// 获取刷新间隔
function getRefreshInterval() {
  if (isTradingTime()) return 8000;
  const h = new Date().getHours();
  if (h >= 9 && h < 15) return 60000;
  return 600000;
}

function App() {
  const [stockData, setStockData] = useState([]);
  const [indexData, setIndexData] = useState({});
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filterRange, setFilterRange] = useState({ min: -10, max: 10 });
  
  const [marketStats, setMarketStats] = useState({ up: 0, flat: 0, down: 0, volume: 0 });
  
  const refreshRef = useRef(null);

  // 计算统计数据
  const calcStats = (data) => {
    let up = 0, flat = 0, down = 0, vol = 0;
    data.forEach(s => {
      const c = s.changePercent || 0;
      if (c > 0) up++; else if (c < 0) down++; else flat++;
      vol += s.turnover || 0;
    });
    return { up, flat, down, volume: vol / 10000 };
  };

  // 获取股票数据
  const loadData = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    try {
      const codes = getAllStockCodes();
      const data = await fetchStockData(codes);
      
      // 过滤并添加行业分类
      const valid = data
        .filter(s => s?.code && s?.stockName)
        .filter(s => /^(sh60|sh68|sz00|sz30)/.test(s.code))
        .filter(s => !s.code.startsWith('sh000') && !s.code.startsWith('sz399'))
        .filter(s => s.circulationMarket || s.totalMarket)
        .map(s => {
          const sec = getStockSector(s.code, s.stockName);
          return { ...s, sector: sec.code, sectorName: sec.name };
        });
      
      setStockData(valid);
      setLastUpdateTime(new Date());
      setMarketStats(calcStats(valid));
    } catch (e) {
      console.error('加载失败:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // 获取指数
  const loadIndex = useCallback(async () => {
    try {
      const data = await fetchIndexData(Object.keys(indices));
      const map = {};
      data.forEach(i => map[i.code] = i);
      setIndexData(map);
    } catch (e) {
      console.error('指数加载失败:', e);
    }
  }, []);

  // 初始化
  useEffect(() => {
    loadData();
    loadIndex();
  }, [loadData, loadIndex]);

  // 定时刷新
  useEffect(() => {
    const tick = () => { loadData(); loadIndex(); };
    const interval = getRefreshInterval();
    refreshRef.current = setInterval(tick, interval);
    return () => clearInterval(refreshRef.current);
  }, [loadData, loadIndex]);

  // 页面可见性
  useEffect(() => {
    const onVisible = () => { if (!document.hidden) loadData(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadData]);

  // 筛选
  const filteredData = stockData.filter(s => {
    if (selectedMarket === 'sh' && !s.code.startsWith('sh')) return false;
    if (selectedMarket === 'sz' && !s.code.startsWith('sz00')) return false;
    if (selectedMarket === 'cy' && !s.code.startsWith('sz30')) return false;
    if (selectedMarket === 'kc' && !s.code.startsWith('sh688')) return false;
    if (selectedSectors.length > 0 && !selectedSectors.includes(s.sector)) return false;
    const c = s.changePercent || 0;
    return c >= filterRange.min && c <= filterRange.max;
  });

  // 顶部指数条
  const topIndices = Object.values(indexData).slice(0, 4);
  
  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* 顶部栏 */}
      <div className="h-7 bg-black border-b border-gray-800 flex items-center px-3 text-xs justify-between">
        <div className="flex gap-4">
          {topIndices.map(idx => {
            const c = idx.changePercent || 0;
            return (
              <span key={idx.code} className={c > 0 ? 'text-red-400' : c < 0 ? 'text-green-400' : 'text-gray-400'}>
                {idx.stockName?.replace('指数','')} {idx.price?.toFixed(2)} {c > 0 ? '+' : ''}{c.toFixed(2)}%
              </span>
            );
          })}
        </div>
        <div className="flex gap-2 text-gray-500">
          <span>{lastUpdateTime?.toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'})}</span>
          <button onClick={loadData} className="hover:text-white">刷新</button>
        </div>
      </div>

      {/* 主区域 */}
      <div className="flex-1 flex">
        {/* 左侧筛选 */}
        <div className="w-48 bg-black/90 border-r border-gray-800 p-3 overflow-y-auto text-xs">
          <div className="mb-3">
            <div className="text-gray-400 mb-1">市场</div>
            {['all','sh','sz','cy','kc'].map(m => (
              <button key={m} onClick={() => setSelectedMarket(m)}
                className={`mr-1 px-2 py-0.5 ${selectedMarket===m?'bg-gray-700':''}`}>
                {m==='all'?'全部':m==='sh'?'上证':m==='sz'?'深证':m==='cy'?'创业板':'科创'}
              </button>
            ))}
          </div>
          <div className="mb-3">
            <div className="text-gray-400 mb-1">涨跌幅</div>
            <input type="range" min="-10" max="10" value={filterRange.min} 
              onChange={e => setFilterRange({...filterRange, min: +e.target.value})} className="w-full"/>
            <div className="text-center">{filterRange.min}% ~ {filterRange.max}%</div>
          </div>
          <div className="mb-3">
            <div className="text-gray-400 mb-1">统计</div>
            <div>上涨: <span className="text-red-400">{marketStats.up}</span></div>
            <div>下跌: <span className="text-green-400">{marketStats.down}</span></div>
            <div>成交: <span>{marketStats.volume?.toFixed(1)}万亿</span></div>
          </div>
          <div>
            <div className="text-gray-400 mb-1">行业筛选</div>
            {Object.keys(sectors).slice(0,10).map(s => (
              <label key={s} className="block">
                <input type="checkbox" checked={selectedSectors.includes(s)}
                  onChange={e => {
                    if (e.target.checked) setSelectedSectors([...selectedSectors, s]);
                    else setSelectedSectors(selectedSectors.filter(x => x !== s));
                  }} />
                <span className="ml-1">{sectors[s].name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 热力图 */}
        <div className="flex-1">
          <HeatMap 
            stockData={filteredData} 
            selectedSectors={selectedSectors}
            onStockClick={s => console.log('点击', s)}
            onDrillDown={s => console.log('双击', s)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;