import { allStockCodes, batchCodes, industries, industryStocks } from '../data/stockCodes';

const API_BASE = 'https://qt.gtimg.cn/q=';

// 使用 TextDecoder 解码 GBK
function decodeGBK(uint8Array) {
  try {
    const decoder = new TextDecoder('gbk', { fatal: false });
    return decoder.decode(uint8Array);
  } catch (e) {
    console.error('GBK decode error:', e);
    return '';
  }
}

// 解析腾讯 API 返回的数据
async function parseStockData(text) {
  const stocks = [];
  
  // 腾讯格式: v_sh600519="1~贵州茅台~600519~..."
  const regex = /v_([a-z]+\d+)="([^"]*)"/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const fullCode = match[1];
    const dataStr = match[2];
    
    if (!dataStr || dataStr.length < 10) continue;
    
    const parts = dataStr.split('~');
    if (parts.length < 10) continue;
    
    try {
      // 直接使用返回的字符串（已经解码）
      const name = parts[1] || '';
      const industry = parts[20] || '其他';
      
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
      const volume = parseFloat(parts[6]) || 0;
      const turnover = parseFloat(parts[37]) || 0;
      const turnoverRate = parseFloat(parts[38]) || 0;
      
      // 最高最低价
      const high = parseFloat(parts[33]) || 0;
      const low = parseFloat(parts[34]) || 0;
      
      // 振幅
      let amplitude = 0;
      if (prevClose > 0) {
        amplitude = ((high - low) / prevClose) * 100;
      }
      
      // 市值（亿元）
      const marketCap = parseFloat(parts[44]) || 0;
      
      stocks.push({
        code: fullCode,
        name,
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
        value: Math.abs(change),
      });
    } catch (e) {
      console.warn('Parse error for stock:', fullCode, e);
    }
  }
  
  return stocks;
}

// 获取股票数据（使用 ArrayBuffer 正确解码 GBK）
export async function fetchStocks(codes = null) {
  const targetCodes = codes || allStockCodes.slice(0, 200);
  const batches = batchCodes(targetCodes, 100);
  
  const allStocks = [];
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      const codeStr = batch.join(',');
      const url = `${API_BASE}${codeStr}`;
      
      // 使用 arrayBuffer 获取原始二进制数据
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      
      // 使用 GBK 解码
      const text = decodeGBK(new Uint8Array(buffer));
      
      const stocks = await parseStockData(text);
      
      if (stocks.length > 0) {
        allStocks.push(...stocks);
      }
      
      if (i < batches.length - 1) {
        await new Promise(r => setTimeout(r, 100));
      }
    } catch (err) {
      console.error(`Batch ${i + 1} error:`, err);
    }
  }
  
  // 去重
  const seen = new Set();
  const uniqueStocks = allStocks.filter(s => {
    if (seen.has(s.code)) return false;
    seen.add(s.code);
    return true;
  });
  
  return uniqueStocks;
}

// 按行业获取股票
export async function fetchStocksByIndustry(industry) {
  if (industry === '全部' || !industry) {
    return fetchStocks();
  }
  
  const codes = industryStocks[industry];
  if (!codes || codes.length === 0) {
    return [];
  }
  
  return fetchStocks(codes);
}

// 导出行业列表
export { industries, industryStocks };
