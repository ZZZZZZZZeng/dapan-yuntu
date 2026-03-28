// 腾讯财经API - A股实时行情数据获取
// API地址：http://qt.gtimg.cn/q=sh600000,sz000001

// GBK解码器 - 用于处理腾讯API返回的GBK编码数据
class GBKDecoder {
  constructor() {
    // GBK编码表（常用汉字）
    this.gbkTable = this._initGBKTable();
  }

  _initGBKTable() {
    // 简化版GBK解码 - 使用TextDecoder API
    return null;
  }

  // 解码GBK字节数组为字符串
  decode(buffer) {
    try {
      // 优先使用TextDecoder（现代浏览器支持GBK）
      const decoder = new TextDecoder('gbk', { fatal: false });
      return decoder.decode(buffer);
    } catch (e) {
      console.warn('GBK解码失败，尝试使用utf-8:', e);
      try {
        const decoder = new TextDecoder('utf-8', { fatal: false });
        return decoder.decode(buffer);
      } catch (e2) {
        console.error('所有解码方式失败:', e2);
        return '';
      }
    }
  }

  // 解码GBK字符串（从ArrayBuffer或Uint8Array）
  decodeFromBuffer(arrayBuffer) {
    const uint8Array = new Uint8Array(arrayBuffer);
    return this.decode(uint8Array);
  }
}

// GBK解码器实例
const gbkDecoder = new GBKDecoder();

// 腾讯API字段映射（字段顺序对应API返回的数据）
const FIELD_MAPPING = {
  0: 'stockCode',        // 股票代码
  1: 'stockName',        // 股票名称
  2: 'price',            // 当前价格
  3: 'close',            // 昨收
  4: 'open',             // 开盘价
  5: 'volume',           // 成交量（手）
  6: 'bidVolume',        // 外盘
  7: 'askVolume',        // 内盘
  8: 'bid1',             // 买一
  9: 'bid1Volume',       // 买一量
  10: 'bid2',            // 买二
  11: 'bid2Volume',      // 买二量
  12: 'bid3',            // 买三
  13: 'bid3Volume',      // 买三量
  14: 'bid4',            // 买四
  15: 'bid4Volume',      // 买四量
  16: 'bid5',            // 买五
  17: 'bid5Volume',      // 买五量
  18: 'ask1',            // 卖一
  19: 'ask1Volume',      // 卖一量
  20: 'ask2',            // 卖二
  21: 'ask2Volume',      // 卖二量
  22: 'ask3',            // 卖三
  23: 'ask3Volume',      // 卖三量
  24: 'ask4',            // 卖四
  25: 'ask4Volume',      // 卖四量
  26: 'ask5',            // 卖五
  27: 'ask5Volume',      // 卖五量
  28: 'latestDeal',     // 最近成交
  29: 'date',            // 日期
  30: 'time',            // 时间
  31: 'change',          // 涨跌
  32: 'changePercent',  // 涨跌幅%
  33: 'high',            // 最高
  34: 'low',             // 最低
  35: 'priceVolume',     // 价格/成交量（手）/成交额
  36: 'volumeHand',      // 成交量（手）
  37: 'turnover',        // 成交额（万）
  38: 'turnoverRate',    // 换手率%
  39: 'peRatio',         // 市盈率
  40: 'amplitude',       // 振幅%
  41: 'circulationMarket', // 流通市值
  42: 'totalMarket',      // 总市值
  43: 'pbRatio',          // 市净率
  44: 'highLimit',        // 涨停价
  45: 'lowLimit',         // 跌停价
  46: 'maRatio',          // 量比
  47: 'avgPrice',          // 均价
  48: 'peDynamic',         // 动态市盈率
  49: 'peStatic',          // 静态市盈率
  50: 'beta',              // Beta系数
};

// 解析单条股票数据
function parseStockData(dataStr) {
  if (!dataStr || dataStr.length < 10) return null;
  
  const fields = dataStr.split('~');
  if (fields.length < 10) return null;
  
  // 提取基本信息
  const stockCode = fields[0] || '';
  const stockName = fields[1] || '';
  const price = parseFloat(fields[2]) || 0;
  const close = parseFloat(fields[3]) || 0;
  const open = parseFloat(fields[4]) || 0;
  const high = parseFloat(fields[5]) || 0;
  const low = parseFloat(fields[6]) || 0;
  const volume = parseFloat(fields[7]) || 0; // 成交量（万手）
  const turnover = parseFloat(fields[8]) || 0; // 成交额（万）
  const turnoverRate = parseFloat(fields[9]) || 0; // 换手率
  
  // 计算涨跌幅
  const change = price - close;
  const changePercent = close > 0 ? (change / close) * 100 : 0;
  
  // 流通市值和总市值
  const circulationMarket = parseFloat(fields[10]) || 0;
  const totalMarket = parseFloat(fields[11]) || 0;
  
  return {
    stockCode,
    stockName,
    price,
    close,
    open,
    high,
    low,
    change,
    changePercent,
    volume,
    turnover,
    turnoverRate,
    circulationMarket,
    totalMarket,
    updateTime: new Date().toISOString(),
  };
}

// 批量获取股票数据
export async function fetchStockData(stockCodes) {
  if (!stockCodes || stockCodes.length === 0) {
    return [];
  }
  
  // 分批处理，每批最多60只（腾讯API限制）
  const batchSize = 60;
  const results = [];
  
  for (let i = 0; i < stockCodes.length; i += batchSize) {
    const batch = stockCodes.slice(i, i + batchSize);
    const codesStr = batch.join(',');
    
    try {
      // 使用腾讯API - 添加随机参数避免缓存
      const timestamp = Date.now();
      const url = `http://qt.gtimg.cn/q=${codesStr}?_=${timestamp}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain, */*',
        },
      });
      
      if (!response.ok) {
        console.warn(`API请求失败: ${response.status}`);
        continue;
      }
      
      // 获取ArrayBuffer并解码GBK
      const buffer = await response.arrayBuffer();
      const text = gbkDecoder.decodeFromBuffer(buffer);
      
      // 解析返回的数据
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes('=')) continue;
        
        // 提取变量名和数据
        const match = trimmed.match(/v_([sh]\w+)="(.+)"/);
        if (match) {
          const stockCode = match[1];
          const dataStr = match[2];
          const parsedData = parseStockData(dataStr);
          if (parsedData && parsedData.stockName) {
            results.push({
              code: stockCode,
              ...parsedData
            });
          }
        }
      }
    } catch (error) {
      console.error('获取股票数据失败:', error);
    }
  }
  
  return results;
}

// 获取指数数据
export async function fetchIndexData(indexCodes) {
  const data = await fetchStockData(indexCodes);
  return data.map(item => ({
    ...item,
    isIndex: true,
  }));
}

// 获取个股详细数据
export async function fetchStockDetail(stockCode) {
  const data = await fetchStockData([stockCode]);
  return data[0] || null;
}

// 按行业获取股票
export function getStocksBySector(sectorCode) {
  // 动态导入避免循环依赖
  const { stockList } = require('./stockCodes.js');
  return stockList[sectorCode] || [];
}

// 获取市场分类（按市值分层）
export function classifyByMarketCap(stockData) {
  const sorted = [...stockData].sort((a, b) => (b.totalMarket || 0) - (a.totalMarket || 0));
  const total = sorted.length;
  
  return {
    largeCap: sorted.slice(0, Math.floor(total * 0.1)), // 大市值前10%
    midCap: sorted.slice(Math.floor(total * 0.1), Math.floor(total * 0.3)), // 中市值10-30%
    smallCap: sorted.slice(Math.floor(total * 0.3)), // 小市值后70%
  };
}

// 计算涨跌幅颜色 - 用于热力图
export function getChangeColor(changePercent) {
  if (changePercent > 5) return '#7f1d1d'; // 深红
  if (changePercent > 3) return '#991b1b'; // 红
  if (changePercent > 1) return '#dc2626'; // 浅红
  if (changePercent > 0) return '#fca5a5'; // 淡红
  if (changePercent === 0) return '#6b7280'; // 灰色
  if (changePercent > -1) return '#86efac'; // 淡绿
  if (changePercent > -3) return '#16a34a'; // 浅绿
  if (changePercent > -5) return '#15803d'; // 绿
  return '#14532d'; // 深绿
}

// 导出API函数
export default {
  fetchStockData,
  fetchIndexData,
  fetchStockDetail,
  getStocksBySector,
  classifyByMarketCap,
  getChangeColor,
  gbkDecoder,
};
