import { hotStockCodes, allStockCodes, batchCodes } from '../data/stockCodes';

const API_BASE = 'https://qt.gtimg.cn/q=';

// 解码 GBK 编码的字符串
async function decodeGBK(str) {
  if (!str || typeof str !== 'string') return str;
  
  try {
    // 将字符串转为字节数组
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i) & 0xFF);
    }
    const uint8Array = new Uint8Array(bytes);
    
    // 使用 GBK 解码
    const decoder = new TextDecoder('gbk', { fatal: false });
    return decoder.decode(uint8Array);
  } catch (e) {
    console.warn('GBK decode failed, returning raw:', e);
    return str;
  }
}

// 解析腾讯 API 返回的数据
async function parseStockData(text) {
  const stocks = [];
  
  // 腾讯格式: v_sh600519="1~贵州茅台~600519~..."
  // 使用非贪婪匹配确保正确解析
  const regex = /v_([a-z]+\d+)="([^"]*)"/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const fullCode = match[1];
    const dataStr = match[2];
    
    if (!dataStr || dataStr.length < 10) {
      console.warn('Empty or too short data for:', fullCode);
      continue;
    }
    
    const parts = dataStr.split('~');
    
    if (parts.length < 10) {
      console.warn('Not enough fields for:', fullCode, 'fields:', parts.length);
      continue;
    }
    
    try {
      // 解码中文名称
      const rawName = parts[1] || '';
      const name = await decodeGBK(rawName);
      
      // 解析价格数据
      const currentPrice = parseFloat(parts[3]) || 0;
      const prevClose = parseFloat(parts[4]) || 0;
      const openPrice = parseFloat(parts[5]) || 0;
      
      // 计算涨跌幅
      let change = 0;
      if (prevClose > 0) {
        change = ((currentPrice - prevClose) / prevClose) * 100;
      }
      
      // 成交量相关
      const volume = parseFloat(parts[6]) || 0; // 成交量（手）
      const turnover = parseFloat(parts[37]) || 0; // 成交额（万元）
      const turnoverRate = parseFloat(parts[38]) || 0; // 换手率
      
      // 最高最低价
      const high = parseFloat(parts[33]) || 0;
      const low = parseFloat(parts[34]) || 0;
      
      // 振幅
      let amplitude = 0;
      if (prevClose > 0) {
        amplitude = ((high - low) / prevClose) * 100;
      }
      
      // 所属行业
      const industry = await decodeGBK(parts[20] || '');
      
      // 市值
      const marketCap = parseFloat(parts[44]) || 0;
      
      stocks.push({
        code: fullCode,
        name: name || rawName,
        price: currentPrice,
        prevClose,
        open: openPrice,
        change,
        volume,
        turnover,
        turnoverRate,
        amplitude,
        high,
        low,
        industry,
        marketCap,
        // 用于热力图的颜色值
        value: Math.abs(change),
      });
    } catch (e) {
      console.warn('Parse error for stock:', fullCode, e);
    }
  }
  
  return stocks;
}

// 分批获取股票数据
export async function fetchStocks(codes = null) {
  const targetCodes = codes || hotStockCodes;
  const batches = batchCodes(targetCodes, 60); // 每批60只，避免URL过长
  
  const allStocks = [];
  const failedBatches = [];
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      const codeStr = batch.join(',');
      const url = `${API_BASE}${codeStr}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Referer': 'https://qt.gtimg.cn/',
        },
      });
      
      if (!response.ok) {
        console.warn(`Batch ${i + 1}/${batches.length} failed: ${response.status}`);
        failedBatches.push(batch);
        continue;
      }
      
      const text = await response.text();
      const stocks = await parseStockData(text);
      
      if (stocks.length > 0) {
        allStocks.push(...stocks);
        console.log(`Batch ${i + 1}/${batches.length}: Got ${stocks.length} stocks`);
      }
      
      // 控制请求频率
      if (i < batches.length - 1) {
        await new Promise(r => setTimeout(r, 50));
      }
    } catch (err) {
      console.error(`Batch ${i + 1} error:`, err);
      failedBatches.push(batch);
    }
  }
  
  // 去重
  const seen = new Set();
  const uniqueStocks = allStocks.filter(s => {
    if (seen.has(s.code)) return false;
    seen.add(s.code);
    return true;
  });
  
  console.log(`Total unique stocks: ${uniqueStocks.length}`);
  if (failedBatches.length > 0) {
    console.warn(`Failed batches: ${failedBatches.length}`);
  }
  
  return uniqueStocks;
}

// 获取热门股票
export async function fetchHotStocks() {
  return fetchStocks(hotStockCodes);
}

// 获取所有 A 股（分批）
export async function fetchAllStocks(progressCallback = null) {
  const batches = batchCodes(allStockCodes, 100);
  const allStocks = [];
  
  for (let i = 0; i < batches.length; i++) {
    const stocks = await fetchStocks(batches[i]);
    allStocks.push(...stocks);
    
    if (progressCallback) {
      progressCallback((i + 1) / batches.length, allStocks.length);
    }
  }
  
  return allStocks;
}