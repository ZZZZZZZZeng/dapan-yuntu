import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { sectors, getStockSector } from '../data/stockCodes';
import { getChangeColor } from '../api/stockApi';

const HeatMap = ({ 
  stockData, 
  selectedSectors,
  selectedIndex,
  filterRange,
  onStockClick,
  onDrillDown,
  isReviewMode = false,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredStock, setHoveredStock] = useState(null);

  // 获取文字颜色（根据背景色亮度决定黑白）
  const getTextColor = useCallback((bgColor) => {
    // 简单的亮度计算
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }, []);

  // 准备ECharts数据 - 纯行业+个股两层结构
  const prepareChartData = useCallback(() => {
    if (!stockData || stockData.length === 0) {
      return [];
    }

    // 按行业分组
    const sectorGroups = {};
    
    // 只保留真实的一级行业，过滤掉所有指数/策略类分组
    const validSectors = Object.keys(sectors);
    
    // 初始化需要显示的行业
    const sectorsToShow = selectedSectors.length > 0 
      ? selectedSectors.filter(s => validSectors.includes(s))
      : validSectors;
    
    sectorsToShow.forEach(sectorCode => {
      const sectorInfo = sectors[sectorCode];
      if (sectorInfo) {
        sectorGroups[sectorCode] = {
          name: sectorInfo.name,
          code: sectorCode,
          children: [],
          // 板块统计数据
          upCount: 0,
          downCount: 0,
          totalChange: 0,
        };
      }
    });

    // 将股票分配到行业
    stockData.forEach(stock => {
      const stockSector = getStockSector(stock.code);
      const assignedSector = stockSector.code;
      
      // 只处理有效的行业分组
      if (sectorGroups[assignedSector]) {
        const changePercent = stock.changePercent || 0;
        const bgColor = getChangeColor(changePercent);
        const textColor = getTextColor(bgColor);
        
        // 更新板块统计
        if (changePercent > 0) sectorGroups[assignedSector].upCount++;
        else if (changePercent < 0) sectorGroups[assignedSector].downCount++;
        sectorGroups[assignedSector].totalChange += changePercent;
        
        sectorGroups[assignedSector].children.push({
          name: stock.stockName || stock.code,
          value: stock.circulationMarket || stock.totalMarket || 100, // 面积对应流通市值
          code: stock.code,
          itemStyle: {
            color: bgColor,
          },
          label: {
            color: textColor,
            fontSize: 10,
            lineHeight: 13,
            overflow: 'truncate',
            formatter: (params) => {
              const stock = params.data?.data;
              if (!stock) return params.name;
              const change = stock.changePercent || 0;
              const sign = change > 0 ? '+' : '';
              const shortName = params.name.length > 4 ? params.name.slice(0, 4) : params.name;
              return `${shortName}\n${sign}${change.toFixed(2)}%`;
            },
          },
          data: stock,
        });
      }
    });

    // 转换为ECharts treemap需要的格式 - 只有行业和个股两层
    return Object.values(sectorGroups)
      .filter(group => group.children.length > 0)
      .map(group => {
        // 计算板块平均涨跌幅
        const avgChange = group.children.length > 0 ? group.totalChange / group.children.length : 0;
        const changeSign = avgChange > 0 ? '+' : '';
        const changeColor = avgChange > 0 ? '#ff4d4f' : avgChange < 0 ? '#36d399' : '#9ca3af';
        
        return {
          name: `${group.name} ${changeSign}${avgChange.toFixed(2)}% (${group.upCount}↑${group.downCount}↓)`,
          itemStyle: {
            borderColor: '#1e293b',
            borderWidth: 3,
            gapWidth: 2,
          },
          upperLabel: {
            show: true,
            height: 24,
            color: changeColor,
            fontSize: 12,
            fontWeight: 'bold',
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
          },
          children: group.children,
        };
      });
  }, [stockData, selectedSectors, getChangeColor, getTextColor]);

  // 初始化ECharts
  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current, 'dark', {
      renderer: 'canvas',
    });

    // 设置基础配置
    const option = {
      backgroundColor: '#0a0e17', // 深色科技风背景
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(17, 24, 39, 0.98)',
        borderColor: '#374151',
        borderWidth: 1,
        textStyle: {
          color: '#f3f4f6',
        },
        formatter: (params) => {
          const data = params.data?.data;
          if (!data) return params.name;
          
          const changePercent = data.changePercent || 0;
          const changeColor = changePercent > 0 ? '#ef4444' : changePercent < 0 ? '#22c55e' : '#9ca3af';
          const changeSign = changePercent > 0 ? '+' : '';
          
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">${data.stockName || data.code}</div>
              <div style="display: grid; grid-template-columns: auto auto; gap: 8px 16px; font-size: 12px;">
                <span style="color: #9ca3af;">代码:</span>
                <span>${data.code}</span>
                <span style="color: #9ca3af;">价格:</span>
                <span style="font-weight: bold;">¥${data.price?.toFixed(2) || '--'}</span>
                <span style="color: #9ca3af;">涨跌:</span>
                <span style="color: ${changeColor}; font-weight: bold;">${changeSign}${changePercent.toFixed(2)}%</span>
                <span style="color: #9ca3af;">市值:</span>
                <span>${data.totalMarket ? (data.totalMarket / 100000000).toFixed(2) + '亿' : '--'}</span>
              </div>
            </div>
          `;
        },
      },
      series: [
        {
          type: 'treemap',
          width: '100%',
          height: '100%',
          roam: false,
          nodeClick: false,
          breadcrumb: {
            show: false,
          },
          // 行业分组标签（上层）
          upperLabel: {
            show: true,
            height: 24,
            color: '#e5e7eb',
            fontSize: 12,
            fontWeight: 'bold',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            formatter: (params) => {
              return ` ${params.name}`;
            },
          },
          // 股票标签（下层）
          label: {
            show: true,
            fontSize: 10,
            fontWeight: 'normal',
            color: '#fff',
            lineHeight: 13,
            overflow: 'truncate',
            formatter: (params) => {
              const stock = params.data?.data;
              if (!stock) return params.name;
              const change = stock.changePercent || 0;
              const sign = change > 0 ? '+' : '';
              // 只显示4个字符的股票名称 + 涨跌幅，确保小方块也能显示
              const shortName = params.name.length > 4 ? params.name.slice(0, 4) : params.name;
              return `${shortName}\n${sign}${change.toFixed(2)}%`;
            },
          },
          itemStyle: {
            borderColor: '#0f172a',
            borderWidth: 1,
            gapWidth: 1,
            borderRadius: 0,
          },
          levels: [
            // 行业层级
            {
              itemStyle: {
                borderColor: '#1e293b',
                borderWidth: 3,
                gapWidth: 2,
              },
              upperLabel: {
                show: true,
                position: 'top',
              },
            },
            // 股票层级
            {
              itemStyle: {
                borderColor: '#0f172a',
                borderWidth: 1,
                gapWidth: 1,
              },
              label: {
                show: true,
              },
            },
          ],
          data: [],
        },
      ],
    };

    chartInstance.current.setOption(option);

    // 点击事件
    chartInstance.current.on('click', (params) => {
      if (params.data?.data) {
        onStockClick?.(params.data.data);
      }
    });

    // 双击事件
    chartInstance.current.on('dblclick', (params) => {
      if (params.data?.data) {
        onDrillDown?.(params.data.data);
      }
    });

    // 鼠标悬浮事件
    chartInstance.current.on('mouseover', (params) => {
      if (params.data?.data) {
        setHoveredStock(params.data.data);
      }
    });

    // 鼠标移出事件
    chartInstance.current.on('mouseout', () => {
      setHoveredStock(null);
    });

    // 响应式
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [onStockClick, onDrillDown]);

  // 更新图表数据
  useEffect(() => {
    if (!chartInstance.current) return;

    const chartData = prepareChartData();
    
    chartInstance.current.setOption({
      series: [{
        data: chartData,
      }],
      // 平滑动画过渡，0.3秒淡入
      animation: true,
      animationDuration: 300,
      animationEasing: 'cubicOut',
    });
  }, [prepareChartData]);

  return (
    <div className="relative w-full h-full">
      <div ref={chartRef} className="w-full h-full" />
      
      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="flex items-center space-x-2 text-gray-400">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">加载中...</span>
          </div>
        </div>
      )}

      {/* 空数据提示 */}
      {!isLoading && stockData?.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium mb-1">暂无数据</p>
            <p className="text-sm opacity-70">请稍候，正在加载股票数据...</p>
          </div>
        </div>
      )}

      {/* 复盘模式覆盖层 */}
      {isReviewMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-600/90 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">复盘模式</span>
            <span className="text-yellow-200">使用 ← → 方向键浏览历史</span>
            <span className="text-yellow-200 text-sm">| 按 ESC 退出</span>
          </div>
        </div>
      )}

      {/* 悬浮股票信息 */}
      {hoveredStock && (
        <div className="absolute bottom-4 right-4 bg-gray-800/95 border border-gray-700 rounded-lg p-4 shadow-xl max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-white">{hoveredStock.stockName}</span>
            <span className="text-xs text-gray-400">{hoveredStock.code}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-400">价格:</div>
            <div className={`font-mono font-bold ${
              (hoveredStock.changePercent || 0) > 0 ? 'text-red-400' : 
              (hoveredStock.changePercent || 0) < 0 ? 'text-green-400' : 'text-gray-400'
            }`}>
              ¥{hoveredStock.price?.toFixed(2)}
            </div>
            <div className="text-gray-400">涨跌:</div>
            <div className={`font-mono ${
              (hoveredStock.changePercent || 0) > 0 ? 'text-red-400' : 
              (hoveredStock.changePercent || 0) < 0 ? 'text-green-400' : 'text-gray-400'
            }`}>
              {(hoveredStock.changePercent || 0) > 0 ? '+' : ''}{hoveredStock.changePercent?.toFixed(2)}%
            </div>
            <div className="text-gray-400">市值:</div>
            <div className="font-mono text-gray-300">
              {hoveredStock.totalMarket 
                ? (hoveredStock.totalMarket / 100000000).toFixed(2) + '亿'
                : '--'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatMap;
