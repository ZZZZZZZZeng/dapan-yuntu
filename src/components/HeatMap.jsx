import React, { useEffect, useRef, memo } from 'react';
import * as echarts from 'echarts';
import { sectors, getStockSector } from '../data/stockCodes';
import { getChangeColor } from '../api/stockApi';

// 颜色辅助函数
function getTextColor(bgColor) {
  if (!bgColor || bgColor.length < 7) return '#ffffff';
  try {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  } catch {
    return '#ffffff';
  }
}

// 准备数据：行业分组 + 个股嵌套
function prepareChartData(stockData, selectedSectors) {
  if (!stockData || stockData.length === 0) return [];

  const sectorGroups = {};
  const validSectors = Object.keys(sectors);
  
  // 初始化行业
  const sectorsToShow = selectedSectors?.length > 0 
    ? selectedSectors.filter(s => validSectors.includes(s))
    : validSectors;
  
  sectorsToShow.forEach(code => {
    const info = sectors[code];
    if (info) {
      sectorGroups[code] = { name: info.name, value: 0, children: [] };
    }
  });

  // 分类股票
  stockData.forEach(stock => {
    let sector = stock.sector || getStockSector(stock.code, stock.stockName || '').code;
    if (!sectorGroups[sector]) sector = 'other';
    if (!sectorGroups[sector]) return;
    
    const change = stock.changePercent || 0;
    const value = stock.circulationMarket || stock.totalMarket || 100;
    const color = getChangeColor(change);
    
    sectorGroups[sector].value += value;
    sectorGroups[sector].children.push({
      name: stock.stockName || stock.code,
      value,
      itemStyle: { color },
      label: { 
        show: true, 
        color: getTextColor(color),
        fontSize: 8,
        formatter: (p) => {
          const c = p.data?.data?.changePercent || 0;
          const sign = c > 0 ? '+' : '';
          const n = p.name.length > 2 ? p.name.slice(0, 2) : p.name;
          return `${n}\n${sign}${c.toFixed(1)}%`;
        }
      },
      data: stock
    });
  });

  // 返回有数据的行业，按市值排序
  return Object.values(sectorGroups)
    .filter(g => g.children.length > 0)
    .sort((a, b) => b.value - a.value)
    .map(g => ({
      name: g.name,
      value: g.value,
      children: g.children.sort((a, b) => b.value - a.value)
    }));
}

const HeatMap = ({ 
  stockData = [], 
  selectedSectors = [],
  onStockClick,
  onDrillDown,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 初始化ECharts
  useEffect(() => {
    if (!chartRef.current) return;
    
    const chart = echarts.init(chartRef.current, 'dark', { renderer: 'canvas' });
    chartInstance.current = chart;

    chart.setOption({
      backgroundColor: '#000000',
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      animation: true,
      animationDuration: 300,
      animationDurationUpdate: 300,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.95)',
        borderColor: '#333',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: (p) => {
          const d = p.data?.data;
          if (!d) return p.name;
          const c = d.changePercent || 0;
          const color = c > 0 ? '#ff4444' : c < 0 ? '#44ff66' : '#999';
          return `${d.stockName}<br/>¥${d.price?.toFixed(2)}<br/><span style="color:${color}">${c > 0 ? '+' : ''}${c.toFixed(2)}%</span>`;
        },
      },
      series: [{
        type: 'treemap',
        width: '100%', height: '100%',
        left: 0, top: 0, right: 0, bottom: 0,
        roam: false, nodeClick: false,
        breadcrumb: { show: false },
        upperLabel: { show: true, height: 16, color: 'rgba(255,255,255,0.85)', fontSize: 10 },
        label: { show: true, fontSize: 8 },
        itemStyle: { borderColor: '#111', borderWidth: 1, gapWidth: 1 },
        levels: [
          { itemStyle: { borderColor: '#222', borderWidth: 2, gapWidth: 1 } },
          { itemStyle: { borderColor: '#111', borderWidth: 1, gapWidth: 0 } }
        ],
        data: []
      }]
    });

    // 事件
    chart.on('click', (p) => p.data?.data && onStockClick?.(p.data.data));
    chart.on('dblclick', (p) => p.data?.data && onDrillDown?.(p.data.data));

    const resize = () => chart.resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      chart.dispose();
    };
  }, [onStockClick, onDrillDown]);

  // 更新数据
  useEffect(() => {
    if (!chartInstance.current) return;
    const data = prepareChartData(stockData, selectedSectors);
    if (data.length > 0) {
      chartInstance.current.setOption({ series: [{ data }] }, { notMerge: true });
    }
  }, [stockData, selectedSectors]);

  return (
    <div className="w-full h-full bg-black">
      <div ref={chartRef} className="w-full h-full" />
    </div>
  );
};

export default memo(HeatMap);