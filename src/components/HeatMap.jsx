import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as echarts from 'echarts';

const HeatMap = ({ data, loading, isPaused, onStockClick, error, lastUpdateTime, selectedIndustry, selectedMarket, changePercentRange }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const resizeObserver = useRef(null);
  const debounceTimer = useRef(null);
  const isUpdating = useRef(false);

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

  // 预处理数据
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(stock => {
      // 容错：兼容不同字段名
      const changePercent = stock.changePercent || stock.change || stock.zdf || 0;
      const marketValue = stock.circulationMarket || stock.totalMarket || stock.市值 || 100000000;
      const stockName = stock.stockName || stock.name || stock.name || '未知';
      
      return {
        name: stockName,
        value: [
          marketValue, // 面积用流通市值
          changePercent, // 颜色用涨跌幅
        ],
        code: stock.code,
        price: stock.price || 0,
        change: changePercent,
        marketValue: (marketValue / 100000000).toFixed(1) + '亿'
      };
    }).filter(item => item.change !== 0 || item.value > 0); // 过滤无效数据
  }, [data]);

  // 更新图表配置
  const updateChart = useCallback(() => {
    if (!chartInstance.current || processedData.length === 0 || isUpdating.current) return;

    isUpdating.current = true;

    try {
      const option = {
        backgroundColor: '#0a0e17',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(17, 24, 39, 0.98)',
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
                  <span>价格: ¥${data.price.toFixed(2)}</span>
                  <span style="color: ${changeColor}; font-weight: bold;">${changeStr}%</span>
                </div>
                <div style="margin-top: 4px; color: #888; font-size: 11px;">市值: ${data.marketValue}</div>
              </div>
            `;
          }
        },
        series: [{
          type: 'treemap',
          data: processedData,
          leafDepth: 1,
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          label: {
            show: true,
            color: '#fff',
            fontSize: 11,
            fontWeight: 'bold',
            formatter: function(params) {
              const change = params.data.change || 0;
              const changeStr = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
              return `${params.name}\n${changeStr}`;
            },
            lineHeight: 14,
          },
          upperLabel: { show: false },
          itemStyle: {
            borderRadius: 0,
            borderWidth: 1,
            borderColor: '#1e293b',
            gapWidth: 1,
            color: function(params) {
              const change = params.data.change || 0;
              // 严格按照截图配色：涨红跌绿
              if (change > 0.01) { // 上涨：红色系，涨幅越大越红
                const intensity = Math.min(Math.abs(change) / 10, 1);
                return `rgb(${255 - Math.floor(intensity * 30)}, ${Math.max(50, 80 - Math.floor(intensity * 80))}, ${Math.max(50, 80 - Math.floor(intensity * 80))})`;
              } else if (change < -0.01) { // 下跌：绿色系，跌幅越大越绿
                const intensity = Math.min(Math.abs(change) / 10, 1);
                return `rgb(${Math.max(50, 80 - Math.floor(intensity * 80))}, ${255 - Math.floor(intensity * 30)}, ${Math.max(50, 80 - Math.floor(intensity * 80))})`;
              } else { // 平盘：灰色
                return 'rgb(75, 85, 99)';
              }
            }
          },
        }]
      };

      // 强制全量更新，避免旧缓存
      chartInstance.current.setOption(option, { 
        notMerge: true,
        lazyUpdate: false,
        silent: false
      });
      
      // 标记图表已准备好
      setIsChartReady(true);
      
    } catch (err) {
      console.error('Chart update error:', err, processedData.slice(0, 5)); // 打印前5条数据排查
    } finally {
      isUpdating.current = false;
    }
  }, [processedData]);

  // 监听数据变化，更新图表
  useEffect(() => {
    if (processedData.length > 0 && chartInstance.current) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        updateChart();
      }, 50);
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [processedData, updateChart]);

  // 初始化图表
  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      try {
        chartInstance.current = echarts.init(chartRef.current, 'dark', {
          renderer: 'canvas',
          useDirtyRect: false,
          devicePixelRatio: Math.min(window.devicePixelRatio, 1.5),
        });
        
        // 绑定点击事件
        chartInstance.current.on('click', (params) => {
          if (params.data && onStockClick) {
            onStockClick(params.data.code);
          }
        });
        
        // 初始配置
        chartInstance.current.setOption({
          backgroundColor: '#0a0e17',
          series: []
        }, { silent: true });
        
      } catch (err) {
        console.error('Chart init error:', err);
      }
    }
  }, [onStockClick]);

  // 监听窗口大小变化
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

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e17', color: '#fff' }}>
        <div>
          <p>加载失败: {error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '12px', padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0a0e17' }}>
      <div 
        ref={chartRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: (loading || !isChartReady) ? 0.3 : 1,
          transition: 'opacity 0.2s ease'
        }}
      />
      {(loading || !isChartReady) && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 14, 23, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#94a3b8', marginTop: '12px', fontSize: '14px' }}>正在加载...</p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      {isPaused && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.6)',
          padding: '6px 12px',
          borderRadius: '4px',
          color: '#fbbf24',
          fontSize: '12px',
          zIndex: 20
        }}>
          <span>已暂停</span>
        </div>
      )}
    </div>
  );
};

export default HeatMap;