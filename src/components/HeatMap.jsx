import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as echarts from 'echarts';
import { calculateMarketValue } from '../api/stockApi';
import '../styles/HeatMap.css';

const HeatMap = ({ data, loading, isPaused, onStockClick, error, lastUpdateTime, selectedIndustry, selectedMarket, marketValueRange, changePercentRange }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState([]);
  const [isChartReady, setIsChartReady] = useState(false);
  const resizeObserver = useRef(null);
  const rafId = useRef(null);
  const debounceTimer = useRef(null);
  const isUpdating = useRef(false);

  // 使用 requestAnimationFrame 批量处理更新
  const scheduleUpdate = useCallback((updateFn) => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    rafId.current = requestAnimationFrame(() => {
      updateFn();
      rafId.current = null;
    });
  }, []);

  // 防抖处理 resize
  const debouncedResize = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    }, 100);
  }, []);

  // 预处理数据，使用 useMemo 避免重复计算
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(stock => {
      const marketValue = calculateMarketValue(stock.totalCapital, stock.price);
      return {
        name: stock.name,
        code: stock.code,
        value: stock.price,
        change: stock.changePercent,
        industry: stock.industry,
        market: stock.market,
        marketValue: marketValue,
        itemStyle: {
          borderRadius: 4,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }
      };
    });
  }, [data]);

  // 同步 processedData 到 chartData
  useEffect(() => {
    setChartData(processedData);
  }, [processedData]);

  // 更新图表配置 - 核心优化：避免 clear()，使用渐进式更新
  const updateChart = useCallback(() => {
    if (!chartInstance.current || chartData.length === 0 || isUpdating.current) return;

    isUpdating.current = true;

    scheduleUpdate(() => {
      try {
        const container = chartRef.current;
        if (!container) {
          isUpdating.current = false;
          return;
        }

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // 计算最优布局参数
        const dataCount = chartData.length;
        
        // 根据容器比例和数据量动态计算矩形比例
        const containerRatio = containerWidth / containerHeight;
        const idealItemRatio = Math.sqrt(containerRatio);
        
        // 计算网格布局
        const cols = Math.ceil(Math.sqrt(dataCount * idealItemRatio));
        const rows = Math.ceil(dataCount / cols);
        
        // 计算矩形大小和间距
        const gap = 2;
        const cellWidth = (containerWidth - gap * (cols - 1)) / cols;
        const cellHeight = (containerHeight - gap * (rows - 1)) / rows;
        
        // 计算实际矩形大小（考虑间距）
        const rectWidth = Math.max(10, cellWidth - 1);
        const rectHeight = Math.max(10, cellHeight - 1);

        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#333',
            textStyle: {
              color: '#fff',
              fontSize: 12
            },
            formatter: function(params) {
              const data = params.data;
              const changeStr = data.change > 0 ? `+${data.change.toFixed(2)}` : data.change.toFixed(2);
              const changeColor = data.change > 0 ? '#ff6b6b' : data.change < 0 ? '#4ecdc4' : '#fff';
              return `
                <div style="padding: 8px;">
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${data.name}</div>
                  <div style="color: #aaa; font-size: 11px; margin-bottom: 4px;">${data.code}</div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>价格: ¥${data.value.toFixed(2)}</span>
                    <span style="color: ${changeColor}; font-weight: bold;">${changeStr}%</span>
                  </div>
                  <div style="margin-top: 4px; color: #888; font-size: 11px;">市值: ${data.marketValue}</div>
                </div>
              `;
            }
          },
          series: [{
            type: 'custom',
            renderItem: function(params, api) {
              const dataIndex = params.dataIndex;
              const data = chartData[dataIndex];
              
              // 计算位置（从左到右，从上到下）
              const col = dataIndex % cols;
              const row = Math.floor(dataIndex / cols);
              
              const x = col * (cellWidth + gap);
              const y = row * (cellHeight + gap);
              
              // 根据涨跌幅计算颜色
              let color;
              if (data.change > 0) {
                const intensity = Math.min(Math.abs(data.change) / 5, 1);
                color = `rgba(255, 107, 107, ${0.3 + intensity * 0.7})`;
              } else if (data.change < 0) {
                const intensity = Math.min(Math.abs(data.change) / 5, 1);
                color = `rgba(78, 205, 196, ${0.3 + intensity * 0.7})`;
              } else {
                color = 'rgba(128, 128, 128, 0.5)';
              }
              
              return {
                type: 'group',
                children: [
                  {
                    type: 'rect',
                    shape: {
                      x: x,
                      y: y,
                      width: rectWidth,
                      height: rectHeight,
                      r: 4
                    },
                    style: {
                      fill: color,
                      stroke: 'rgba(255, 255, 255, 0.1)',
                      lineWidth: 1
                    }
                  },
                  ...(rectWidth > 40 && rectHeight > 20 ? [
                    {
                      type: 'text',
                      style: {
                        text: data.name,
                        x: x + rectWidth / 2,
                        y: y + rectHeight / 2 - 6,
                        fill: '#fff',
                        fontSize: Math.min(12, rectWidth / 6),
                        textAlign: 'center',
                        textVerticalAlign: 'middle',
                        fontWeight: 'bold'
                      }
                    },
                    {
                      type: 'text',
                      style: {
                        text: `${data.change > 0 ? '+' : ''}${data.change.toFixed(2)}%`,
                        x: x + rectWidth / 2,
                        y: y + rectHeight / 2 + 8,
                        fill: data.change > 0 ? '#ffcccc' : data.change < 0 ? '#ccffff' : '#cccccc',
                        fontSize: Math.min(10, rectWidth / 7),
                        textAlign: 'center',
                        textVerticalAlign: 'middle'
                      }
                    }
                  ] : [])
                ]
              };
            },
            data: chartData
          }]
        };

        // 关键优化：使用 notMerge: false 进行渐进式更新，避免 clear() 导致的闪烁
        // 仅在第一次初始化或数据维度变化时执行 clear
        const shouldClear = !chartInstance.current.getOption().series;
        
        if (shouldClear) {
          chartInstance.current.clear();
        }
        
        chartInstance.current.setOption(option, { 
          notMerge: shouldClear,  // 渐进式更新，避免闪烁
          lazyUpdate: false,
          silent: false
        });
        
        // 标记图表已准备好
        setIsChartReady(true);
        
      } catch (err) {
        console.error('Chart update error:', err);
      } finally {
        isUpdating.current = false;
      }
    });
  }, [chartData, scheduleUpdate]);

  // 监听数据变化，更新图表 - 添加防抖避免频繁更新
  useEffect(() => {
    if (chartData.length > 0 && chartInstance.current) {
      // 使用防抖避免频繁更新导致的闪烁
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        updateChart();
      }, 50); // 50ms 防抖延迟
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [chartData, updateChart]);

  // 初始化 - 移除 setTimeout 延迟，使用同步初始化
  useEffect(() => {
    // 同步初始化，避免延迟导致的黑屏
    if (chartRef.current && !chartInstance.current) {
      try {
        chartInstance.current = echarts.init(chartRef.current, 'dark', {
          renderer: 'canvas'
        });
        
        // 绑定点击事件
        chartInstance.current.on('click', (params) => {
          if (params.data && onStockClick) {
            onStockClick(params.data.code);
          }
        });
        
        // 初始空图表，避免黑屏
        chartInstance.current.setOption({
          backgroundColor: 'transparent',
          series: []
        }, { silent: true });
        
      } catch (err) {
        console.error('Chart init error:', err);
      }
    }
  }, [onStockClick]);

  // 监听窗口大小变化 - 使用 ResizeObserver 和防抖
  useEffect(() => {
    if (!chartRef.current) return;

    resizeObserver.current = new ResizeObserver(() => {
      debouncedResize();
    });

    resizeObserver.current.observe(chartRef.current);

    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
        resizeObserver.current = null;
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debouncedResize]);

  // 清理
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (chartInstance.current) {
        try {
          chartInstance.current.dispose();
        } catch (e) {
          console.warn('Chart dispose error:', e);
        }
        chartInstance.current = null;
      }
    };
  }, []);

  // 渲染 - 优化：避免不必要的 loading 状态，优先展示图表
  if (error) {
    return (
      <div className="heatmap-container">
        <div className="heatmap-error">
          <p>加载失败: {error}</p>
          <button onClick={() => window.location.reload()}>重试</button>
        </div>
      </div>
    );
  }

  // 关键优化：即使 loading 也为 true，也渲染图表容器，避免黑屏
  // 使用 CSS 控制 loading 层的显示，而不是完全隐藏容器
  return (
    <div className="heatmap-wrapper">
      <div 
        ref={chartRef} 
        className="heatmap-container"
        style={{ 
          width: '100%', 
          height: '100%',
          visibility: loading ? 'hidden' : 'visible' // 隐藏但占位，避免布局抖动
        }}
      />
      {(loading || !isChartReady) && (
        <div className="heatmap-loading-overlay">
          <div className="loading-spinner"></div>
          <p>正在加载...</p>
        </div>
      )}
      {isPaused && (
        <div className="heatmap-paused-indicator">
          <span>已暂停</span>
        </div>
      )}
    </div>
  );
};

export default HeatMap;