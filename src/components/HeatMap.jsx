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

  // 预处理数据：按行业分组，生成嵌套treemap结构
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // 按行业分组
    const industryGroups = {};
    data.forEach(stock => {
      const industry = stock.sectorName || stock.industry || '其他';
      if (!industryGroups[industry]) {
        industryGroups[industry] = {
          name: industry,
          children: [],
          value: 0 // 行业总市值
        };
      }
      const marketValue = stock.circulationMarket || stock.totalMarket || 100000000;
      industryGroups[industry].children.push({
        name: stock.stockName || stock.name,
        value: marketValue,
        code: stock.code,
        price: stock.price,
        change: stock.changePercent || 0,
        marketValue: (marketValue / 100000000).toFixed(1) + '亿'
      });
      industryGroups[industry].value += marketValue;
    });
    
    // 转换为treemap需要的数组格式
    return Object.values(industryGroups);
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
            if (params.data.children) {
              // 行业节点
              return `
                <div style="padding: 8px;">
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${params.data.name}</div>
                  <div style="color: #aaa; font-size: 11px;">总市值: ${(params.data.value / 100000000).toFixed(1)}亿</div>
                  <div style="color: #aaa; font-size: 11px;">股票数量: ${params.data.children.length}只</div>
                </div>
              `;
            } else {
              // 股票节点
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
          }
        },
        series: [{
          type: 'treemap',
          data: processedData,
          leafDepth: 2, // 显示两层：行业+股票
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          label: {
            show: true,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            overflow: 'truncate',
          },
          upperLabel: {
            show: true,
            height: 24,
            color: '#fff',
            backgroundColor: 'rgba(30, 41, 59, 0.9)', // 行业标题灰色背景，和截图一致
            fontSize: 13,
            fontWeight: 'bold',
            padding: [4, 8],
          },
          levels: [
            {
              // 行业层级样式
              itemStyle: {
                borderColor: '#1e293b',
                borderWidth: 2,
                gapWidth: 2,
              },
              upperLabel: {
                show: true,
                position: 'top',
              }
            },
            {
              // 股票层级样式
              itemStyle: {
                borderColor: '#1e293b',
                borderWidth: 1,
                gapWidth: 1,
                color: function(params) {
                  const change = params.data.change || 0;
                  if (change > 0) {
                    // 上涨：红色系，涨幅越大颜色越深
                    const intensity = Math.min(Math.abs(change) / 10, 1);
                    return `rgb(${Math.floor(255 - intensity * 50)}, ${Math.floor(60 - intensity * 60)}, ${Math.floor(60 - intensity * 60)})`;
                  } else if (change < 0) {
                    // 下跌：绿色系，跌幅越大颜色越深
                    const intensity = Math.min(Math.abs(change) / 10, 1);
                    return `rgb(${Math.floor(60 - intensity * 60)}, ${Math.floor(200 - intensity * 55)}, ${Math.floor(60 - intensity * 60)})`;
                  } else {
                    // 平盘：灰色
                    return 'rgb(75, 85, 99)';
                  }
                }
              },
              label: {
                show: true,
                position: 'inside',
                fontSize: 11,
                color: '#fff',
                formatter: function(params) {
                  const change = params.data.change || 0;
                  const changeStr = change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
                  return `${params.name}\n${changeStr}`;
                },
                lineHeight: 14,
              }
            }
          ],
        }]
      };

      // 增量更新，避免闪烁
      chartInstance.current.setOption(option, { 
        notMerge: false,
        lazyUpdate: true,
        silent: false
      });
      
      // 标记图表已准备好
      setIsChartReady(true);
      
    } catch (err) {
      console.error('Chart update error:', err);
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
      }, 100);
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
          useDirtyRect: true,
          devicePixelRatio: Math.min(window.devicePixelRatio, 1.5),
        });
        
        // 绑定点击事件
        chartInstance.current.on('click', (params) => {
          if (params.data && !params.data.children && onStockClick) {
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