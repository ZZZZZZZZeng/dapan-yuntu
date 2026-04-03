import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
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
          id: sectorCode, // 唯一ID，让ECharts可识别节点复用
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
          id: stock.code, // 股票代码作为唯一ID，ECharts会复用节点
          name: stock.stockName || stock.code,
          value: stock.circulationMarket || stock.totalMarket || 100, // 面积对应流通市值（固定，不变）
          code: stock.code,
          itemStyle: {
            color: bgColor,
          },
          label: {
            show: true,
            color: textColor,
            fontSize: 8, // 对齐cloudmap极小字号
            lineHeight: 10,
            overflow: 'truncate',
            minVisibleValue: 500000000, // 市值小于5亿的小方块完全隐藏文字，避免拥挤
            formatter: (params) => {
              const stock = params.data?.data;
              if (!stock) return params.name;
              const change = stock.changePercent || 0;
              const sign = change > 0 ? '+' : '';
              const shortName = params.name.length > 3 ? params.name.slice(0, 3) : params.name; // 最多3字
              return `${shortName}\n${sign}${change.toFixed(1)}%`;
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
          id: group.code, // 唯一ID
          name: group.name, // 只显示纯行业名称，和52etf一致
          itemStyle: {
            borderColor: '#0f172a',
            borderWidth: 4, // 行业区域边框更粗更明显
            gapWidth: 2,
          },
          upperLabel: {
            show: true,
            height: 24,
            color: '#e5e7eb',
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

    // 初始化图表 - 使用WebGL渲染器，大幅提升大量节点的渲染性能
    chartInstance.current = echarts.init(chartRef.current, 'dark', {
      renderer: 'canvas', // 降级为Canvas渲染，避免WebGL兼容性问题
      useDirtyRect: true, // 启用脏矩形渲染，仅重绘变化区域
      devicePixelRatio: Math.min(window.devicePixelRatio, 1.5), // 降低分辨率，提升性能
    });

    // 设置基础配置
    const option = {
      backgroundColor: '#0a0e17', // 深色科技风背景
      // 让图表完全填充容器，不留边缘空白
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        containLabel: true,
      },
      // 性能优化配置：平衡流畅度和无黑屏
      animation: false, // 全局强制关闭所有动画
      animationDuration: 0,
      animationDurationUpdate: 0,
      animationEasing: 'linear',
      animationEasingUpdate: 'linear',
      animationThreshold: 99999, // 永远不触发动画
      progressive: 300, // 每批渲染300个节点，平衡速度和流畅度
      progressiveThreshold: 800, // 超过800节点启用渐进式
      progressiveChunkMode: 'sequential', // 顺序渲染，从上到下逐批显示
      useUTC: false,
      hoverLayerThreshold: 99999,
      stateAnimation: { duration: 0 }, // 关闭状态动画
      transitionDuration: 0, // 关闭所有过渡
      blendMode: 'source-over', // 直接覆盖绘制
      emphasis: { focus: 'none' }, // 关闭高亮动画
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
          left: 'center',
          top: 'center',
          roam: false,
          nodeClick: false,
          animation: false, // 系列级强制关闭所有动画
          animationDuration: 0,
          animationDurationUpdate: 0,
          hoverAnimation: false, // 关闭悬浮动画
          squareRatio: 1, // 固定正方形比例，避免重排
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
                borderColor: '#1e293b',
                borderWidth: 1,
                gapWidth: 0, // 个股之间无间隙，排列更紧凑
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
    if (!chartInstance.current || !stockData || stockData.length === 0) return;

    const chartData = prepareChartData();
    
    // 微任务时机更新，确保所有UI渲染完成后再更新图表
    queueMicrotask(() => {
      // 增量更新配置，避免全量重绘
      chartInstance.current?.setOption({
        series: [{
          data: chartData,
        }],
      }, {
        notMerge: false, // 合并配置，不替换整个图表
        lazyUpdate: true, // 批量更新，避免阻塞主线程
        silent: true, // 静默更新，不触发额外事件
      });
    });
  }, [prepareChartData, stockData]);

  return (
    // 强制不透明，绝对不会有半透明效果
    <div className="relative w-full h-full p-1 bg-[#0a0e17] opacity-1" style={{ opacity: 1 }}>
      <div ref={chartRef} className="w-full h-full bg-[#0a0e17] opacity-1" style={{ opacity: 1 }} />

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

// 使用memo包裹组件，仅在props变化时重渲染
export default memo(HeatMap);
