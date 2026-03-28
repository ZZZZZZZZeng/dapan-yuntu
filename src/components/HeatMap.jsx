import React, { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';

export default function HeatMap({ stocks, groupBy = 'industry' }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 处理数据用于 treemap
  const treeData = useMemo(() => {
    if (!stocks || stocks.length === 0) return [];

    if (groupBy === 'industry') {
      // 按行业分组
      const industryMap = {};
      
      stocks.forEach(stock => {
        const industry = stock.industry || '其他';
        if (!industryMap[industry]) {
          industryMap[industry] = [];
        }
        industryMap[industry].push(stock);
      });

      return Object.entries(industryMap).map(([industry, stocks]) => ({
        name: industry,
        itemStyle: { color: '#2d3748' },
        children: stocks.map(stock => ({
          name: stock.name,
          value: stock.marketCap || 100, // 用市值决定方块大小
          itemStyle: {
            color: getColor(stock.change),
          },
          data: stock,
        })),
      }));
    } else {
      // 按涨跌分组
      const upStocks = stocks.filter(s => s.change > 0);
      const downStocks = stocks.filter(s => s.change < 0);
      const flatStocks = stocks.filter(s => s.change === 0);

      const createTreeNode = (stock) => ({
        name: stock.name,
        value: stock.marketCap || 100,
        itemStyle: {
          color: getColor(stock.change),
        },
        data: stock,
      });

      return [
        {
          name: '上涨',
          itemStyle: { color: '#2d3748' },
          children: upStocks.map(createTreeNode),
        },
        {
          name: '下跌',
          itemStyle: { color: '#2d3748' },
          children: downStocks.map(createTreeNode),
        },
        {
          name: '平盘',
          itemStyle: { color: '#2d3748' },
          children: flatStocks.map(createTreeNode),
        },
      ].filter(group => group.children && group.children.length > 0);
    }
  }, [stocks, groupBy]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        formatter: (params) => {
          if (!params.data || !params.data.data) return params.name;
          
          const stock = params.data.data;
          const changeColor = stock.change > 0 ? '#ff4444' : stock.change < 0 ? '#00aa00' : '#888888';
          const changeSign = stock.change > 0 ? '+' : '';
          
          return `
            <div style="padding: 12px; font-size: 14px; line-height: 1.6;">
              <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">
                ${stock.name} <span style="color: #888; font-size: 12px;">(${stock.code})</span>
              </div>
              <div style="display: grid; grid-template-columns: auto auto; gap: 4px 16px;">
                <span>当前价:</span> <span style="font-weight: bold;">¥${stock.price.toFixed(2)}</span>
                <span>涨跌幅:</span> <span style="color: ${changeColor}; font-weight: bold;">${changeSign}${stock.change.toFixed(2)}%</span>
                <span>涨跌额:</span> <span style="color: ${changeColor};">${changeSign}${(stock.price - stock.prevClose).toFixed(2)}</span>
                <span>成交量:</span> <span>${(stock.volume / 10000).toFixed(2)}万手</span>
                <span>成交额:</span> <span>${(stock.turnover / 10000).toFixed(2)}亿</span>
                <span>换手率:</span> <span>${stock.turnoverRate.toFixed(2)}%</span>
                <span>最高:</span> <span>¥${stock.high.toFixed(2)}</span>
                <span>最低:</span> <span>¥${stock.low.toFixed(2)}</span>
                <span>行业:</span> <span>${stock.industry || '-'}</span>
              </div>
            </div>
          `;
        },
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: '#333',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); border-radius: 8px;',
      },
      series: [
        {
          type: 'treemap',
          data: treeData,
          width: '100%',
          height: '100%',
          roam: false,
          nodeClick: false,
          breadcrumb: {
            show: false,
          },
          label: {
            show: true,
            formatter: (params) => {
              if (!params.data || !params.data.data) {
                return params.name;
              }
              const stock = params.data.data;
              const changeSign = stock.change > 0 ? '+' : '';
              return `{name|${stock.name}}\n{change|${changeSign}${stock.change.toFixed(2)}%}`;
            },
            rich: {
              name: {
                fontSize: 11,
                fontWeight: 'bold',
                color: '#fff',
              },
              change: {
                fontSize: 10,
                color: '#fff',
              },
            },
          },
          upperLabel: {
            show: true,
            formatter: (params) => {
              return params.name;
            },
            textStyle: {
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff',
            },
          },
          itemStyle: {
            borderColor: '#1a1a1a',
            borderWidth: 1,
            gapWidth: 1,
          },
          levels: [
            {
              itemStyle: {
                borderColor: '#1a1a1a',
                borderWidth: 2,
                gapWidth: 2,
              },
              upperLabel: {
                show: true,
              },
            },
            {
              itemStyle: {
                borderColor: '#1a1a1a',
                borderWidth: 1,
                gapWidth: 1,
              },
            },
          ],
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [treeData]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
}

// 颜色编码：红色涨，绿色跌
function getColor(change) {
  if (change > 0) {
    // 涨 - 红色系，越涨越红
    const intensity = Math.min(1, change / 10);
    const r = 255;
    const g = Math.floor(68 + (1 - intensity) * 100);
    const b = Math.floor(68 + (1 - intensity) * 100);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (change < 0) {
    // 跌 - 绿色系，越跌越绿
    const intensity = Math.min(1, Math.abs(change) / 10);
    const r = Math.floor(68 + (1 - intensity) * 100);
    const g = 255;
    const b = Math.floor(68 + (1 - intensity) * 100);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // 平盘 - 灰色
    return '#666666';
  }
}
