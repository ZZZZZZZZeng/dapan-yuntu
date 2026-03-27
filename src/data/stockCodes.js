// A 股全量股票代码
// 包含：沪市主板、科创板、深市主板、创业板

// 生成连续代码的辅助函数
function generateRange(prefix, start, end) {
  const codes = [];
  for (let i = start; i <= end; i++) {
    codes.push(`${prefix}${String(i).padStart(6, '0')}`);
  }
  return codes;
}

// 沪市主板 (600000-609999, 601000-601999, 603000-603999, 605000-605999)
const shMainBoard = [
  ...generateRange('sh', 600000, 609999),
];

// 科创板 (688000-688999)
const shSTAR = generateRange('sh', 688000, 688999);

// 深市主板 (000001-000999, 001000-001999, 002000-002999, 003000-003999)
const szMainBoard = generateRange('sz', 1, 3999);

// 创业板 (300000-301999)
const szChiNext = generateRange('sz', 300000, 301999);

// 北交所 (430000-438999, 830000-839999, 870000-879999, 920000-929999)
const bjStocks = [
  ...generateRange('bj', 430000, 438999),
  ...generateRange('bj', 830000, 839999),
  ...generateRange('bj', 870000, 879999),
  ...generateRange('bj', 920000, 929999),
];

// 合并所有股票代码
export const allStockCodes = [
  ...shMainBoard,
  ...shSTAR,
  ...szMainBoard,
  ...szChiNext,
  ...bjStocks,
];

// 去重
export const uniqueStockCodes = [...new Set(allStockCodes)];

// 热门股票代码（优先加载）
export const hotStockCodes = [
  // 上证指数
  'sh000001',
  // 沪深300 成分股 - 大市值蓝筹股
  'sh600519', // 贵州茅台
  'sh600036', // 招商银行
  'sh601398', // 工商银行
  'sh601857', // 中国石油
  'sh601288', // 农业银行
  'sh601628', // 中国人寿
  'sh601166', // 兴业银行
  'sh601318', // 中国平安
  'sh600887', // 伊利股份
  'sh600309', // 万华化学
  'sh601888', // 中国中免
  'sh600009', // 上海机场
  'sh600030', // 中信证券
  'sz000858', // 五粮液
  'sz000333', // 美的集团
  'sz000651', // 格力电器
  'sz002594', // 比亚迪
  'sz000002', // 万科A
  'sz300750', // 宁德时代
  'sz300059', // 东方财富
  'sz300015', // 爱尔眼科
  'sz002415', // 海康威视
  'sz000568', // 泸州老窖
  'sz300122', // 智飞生物
  'sz002230', // 科大讯飞
  'sz300014', // 亿纬锂能
  'sz002475', // 立讯精密
  'sz300124', // 汇川技术
  // 科创板
  'sh688981', // 中芯国际
  'sh688012', // 中微公司
  'sh688036', // 传音控股
  'sh688008', // 澜起科技
  'sh688111', // 金山办公
  'sh688169', // 石头科技
  'sh688126', // 沪硅产业
  'sh688366', // 昊海生科
  // 更多热门股票
  'sh600276', // 恒瑞医药
  'sh601688', // 华泰证券
  'sh600000', // 浦发银行
  'sz000001', // 平安银行
  'sz002142', // 宁波银行
  'sz002001', // 新和成
  'sz000768', // 中航西飞
  'sh600893', // 航发动力
  'sh601899', // 紫金矿业
  'sh600547', // 山东黄金
  'sz000975', // 银泰黄金
  'sh601615', // 明阳智能
  'sz002202', // 金风科技
  'sz000591', // 太阳能
  'sh600905', // 三峡能源
  'sz300274', // 阳光电源
  'sz300316', // 晶盛机电
  'sh601012', // 隆基绿能
  'sh600438', // 通威股份
  'sz002129', // TCL中环
  'sh603260', // 合盛硅业
  'sz002709', // 天赐材料
  'sz002812', // 恩捷股份
  'sz300014', // 亿纬锂能
  'sz300207', // 欣旺达
  'sh688005', // 容百科技
  'sh688567', // 孚能科技
  'sz300073', // 当升科技
  'sh688779', // 长远锂科
];

// 按批次分组（腾讯API限制每次最多约100只）
export function batchCodes(codes, batchSize = 100) {
  const batches = [];
  for (let i = 0; i < codes.length; i += batchSize) {
    batches.push(codes.slice(i, i + batchSize));
  }
  return batches;
}

// 默认导出
export default {
  allStockCodes: uniqueStockCodes,
  hotStockCodes,
  batchCodes,
};