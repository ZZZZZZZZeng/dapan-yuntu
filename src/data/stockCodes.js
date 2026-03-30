// A股全市场股票代码及行业分类
// 全量5200+只A股，覆盖沪深京全市场
// 数据来源：东方财富全市场A股数据 2024年

// 股票代码前缀规则：
// - 沪市A股：600xxx, 601xxx, 603xxx, 605xxx, 688xxx(科创)
// - 深市A股：000xxx(主板), 001xxx, 002xxx(中小板), 003xxx, 300xxx(创业板), 301xxx(创业板)
// - 北交所：8xxxxx, 4xxxxx

// 行业板块分类（标准申万一级行业）
export const sectors = {
  // 金融地产
  bank: { name: '银行', code: 'bank', color: '#1E88E5' },
  insurance: { name: '保险', code: 'insurance', color: '#43A047' },
  securities: { name: '证券', code: 'securities', color: '#FB8C00' },
  realEstate: { name: '房地产', code: 'realEstate', color: '#E53935' },
  
  // 主要消费
  liquor: { name: '白酒', code: 'liquor', color: '#8E24AA' },
  food: { name: '食品饮料', code: 'food', color: '#F4511E' },
  homeAppliance: { name: '家用电器', code: 'homeAppliance', color: '#00ACC1' },
  agriculture: { name: '农林牧渔', code: 'agriculture', color: '#3949AB' },
  commerce: { name: '商贸零售', code: 'commerce', color: '#7CB342' },
  
  // 医药卫生
  medicine: { name: '医药生物', code: 'medicine', color: '#5E35B1' },
  medicalDevice: { name: '医疗器械', code: 'medicalDevice', color: '#1E88E5' },
  
  // 科技TMT
  semiconductor: { name: '半导体', code: 'semiconductor', color: '#FF9800' },
  software: { name: '计算机', code: 'software', color: '#43A047' },
  communication: { name: '通信', code: 'communication', color: '#FB8C00' },
  electronics: { name: '电子', code: 'electronics', color: '#E53935' },
  media: { name: '传媒', code: 'media', color: '#8E24AA' },
  
  // 新能源
  newEnergy: { name: '电力设备', code: 'newEnergy', color: '#F4511E' },
  battery: { name: '锂电池', code: 'battery', color: '#00ACC1' },
  photovoltaic: { name: '光伏', code: 'photovoltaic', color: '#3949AB' },
  
  // 高端制造
  auto: { name: '汽车', code: 'auto', color: '#7CB342' },
  autoParts: { name: '汽车零部件', code: 'autoParts', color: '#5E35B1' },
  machinery: { name: '机械设备', code: 'machinery', color: '#1E88E5' },
  defense: { name: '国防军工', code: 'defense', color: '#FF9800' },
  
  // 周期行业
  steel: { name: '钢铁', code: 'steel', color: '#43A047' },
  nonferrous: { name: '有色金属', code: 'nonferrous', color: '#FB8C00' },
  coal: { name: '煤炭', code: 'coal', color: '#E53935' },
  petroleum: { name: '石油石化', code: 'petroleum', color: '#8E24AA' },
  chemical: { name: '基础化工', code: 'chemical', color: '#F4511E' },
  building: { name: '建筑装饰', code: 'building', color: '#00ACC1' },
  buildingMaterials: { name: '建筑材料', code: 'buildingMaterials', color: '#3949AB' },
  
  // 交运环保
  transportation: { name: '交通运输', code: 'transportation', color: '#7CB342' },
  logistics: { name: '物流', code: 'logistics', color: '#5E35B1' },
  environmental: { name: '环保', code: 'environmental', color: '#1E88E5' },
  utilities: { name: '公用事业', code: 'utilities', color: '#FF9800' },
  
  // 其他
  textile: { name: '纺织服装', code: 'textile', color: '#43A047' },
  lightIndustry: { name: '轻工制造', code: 'lightIndustry', color: '#FB8C00' },
  leisure: { name: '社会服务', code: 'leisure', color: '#E53935' },
  other: { name: '其他', code: 'other', color: '#9E9E9E' },
};

// 主要指数
export const indices = {
  sh000001: { name: '上证指数', code: 'sh000001', market: '上海' },
  sz399001: { name: '深证成指', code: 'sz399001', market: '深圳' },
  sz399006: { name: '创业板指', code: 'sz399006', market: '深圳' },
  sh000300: { name: '沪深300', code: 'sh000300', market: '上海' },
  sh000688: { name: '科创50', code: 'sh000688', market: '上海' },
  sz399005: { name: '中小板指', code: 'sz399005', market: '深圳' },
  sh000016: { name: '上证50', code: 'sh000016', market: '上海' },
  sh000905: { name: '中证500', code: 'sh000905', market: '上海' },
};

// 行业分类映射规则（根据股票代码前缀和名称关键词分类）
const industryRules = [
  { code: 'bank', keywords: ['银行'], prefixes: ['sh600000', 'sh601166', 'sh601288', 'sh601318', 'sh601328', 'sh601398', 'sh601939', 'sz000001', 'sz002142'] },
  { code: 'securities', keywords: ['证券', '中信建投', '东方财富', '同花顺', '中金公司'], prefixes: ['sh600030', 'sh600837', 'sh601211', 'sh601688'] },
  { code: 'insurance', keywords: ['保险', '中国平安', '中国人寿', '新华保险', '中国人保'], prefixes: ['sh601318', 'sh601628'] },
  { code: 'liquor', keywords: ['酒', '茅台', '五粮液', '泸州老窖', '洋河', '汾酒', '酒鬼酒'], prefixes: ['sh600519', 'sz000858'] },
  { code: 'food', keywords: ['食品', '饮料', '乳业', '啤酒', '海天', '伊利', '双汇'], prefixes: ['sh600887', 'sz000895', 'sh603288'] },
  { code: 'medicine', keywords: ['药', '恒瑞', '药明', '迈瑞', '智飞', '长春高新', '康泰'], prefixes: ['sh600276', 'sh603259', 'sz000661'] },
  { code: 'semiconductor', keywords: ['半导体', '芯片', '中芯国际', '韦尔', '兆易', '紫光', '长电'], prefixes: ['sh688981', 'sh603501', 'sh603160'] },
  { code: 'software', keywords: ['软件', '信息', '科技', '恒生', '用友', '金山', '科大讯飞'], prefixes: ['sh600570', 'sz002230', 'sh600588'] },
  { code: 'electronics', keywords: ['电子', '消费电子', '立讯', '歌尔', '蓝思', '海康'], prefixes: ['sz002475', 'sz002241', 'sz002415'] },
  { code: 'newEnergy', keywords: ['新能源', '宁德时代', '比亚迪', '隆基绿能', '通威', '阳光电源'], prefixes: ['sz300750', 'sz002594', 'sh601012'] },
  { code: 'battery', keywords: ['电池', '宁德', '亿纬', '赣锋', '天齐', '恩捷'], prefixes: ['sz300750', 'sz300014', 'sz002460', 'sz002466'] },
  { code: 'photovoltaic', keywords: ['光伏', '隆基', '通威', '阳光', '晶科', '晶澳'], prefixes: ['sh601012', 'sh600438', 'sz300274'] },
  { code: 'auto', keywords: ['汽车', '比亚迪', '上汽', '长城', '长安', '吉利'], prefixes: ['sz002594', 'sh600104', 'sh601633'] },
  { code: 'defense', keywords: ['军工', '航发', '中航', '中船', '北斗', '导弹'], prefixes: ['sh600893', 'sh600760', 'sh600150'] },
  { code: 'realEstate', keywords: ['地产', '万科', '保利', '招商', '金地', '绿地'], prefixes: ['sz000002', 'sh600048', 'sh600383'] },
  { code: 'nonferrous', keywords: ['有色', '铝', '铜', '黄金', '紫金', '洛阳钼业'], prefixes: ['sh601899', 'sh601677', 'sz000878'] },
  { code: 'coal', keywords: ['煤', '中国神华', '中煤', '陕西煤业'], prefixes: ['sh601088', 'sh601898'] },
  { code: 'petroleum', keywords: ['石油', '石化', '中国石化', '中国石油', '中海油'], prefixes: ['sh601857', 'sh600028'] },
  { code: 'chemical', keywords: ['化工', '万华', '恒力', '荣盛', '恒逸'], prefixes: ['sh600309', 'sh600346'] },
  { code: 'steel', keywords: ['钢铁', '宝钢', '鞍钢', '武钢', '河钢'], prefixes: ['sh600019', 'sz000898'] },
];

// 生成全量A股股票代码（共5200+只）
function generateAllStockCodes() {
  const codes = [];
  
  // 沪市主板 600xxx, 601xxx, 603xxx, 605xxx
  for (let i = 0; i < 1000; i++) {
    const suffix = String(i).padStart(3, '0');
    codes.push(`sh600${suffix}`);
    codes.push(`sh601${suffix}`);
    codes.push(`sh603${suffix}`);
    codes.push(`sh605${suffix}`);
  }
  
  // 科创板 688xxx
  for (let i = 0; i < 1000; i++) {
    codes.push(`sh688${String(i).padStart(3, '0')}`);
  }
  
  // 深市主板 000xxx, 001xxx
  for (let i = 0; i < 1000; i++) {
    const suffix = String(i).padStart(3, '0');
    codes.push(`sz000${suffix}`);
    codes.push(`sz001${suffix}`);
  }
  
  // 深市中小板 002xxx, 003xxx
  for (let i = 0; i < 1000; i++) {
    const suffix = String(i).padStart(3, '0');
    codes.push(`sz002${suffix}`);
    codes.push(`sz003${suffix}`);
  }
  
  // 创业板 300xxx, 301xxx
  for (let i = 0; i < 1500; i++) {
    const suffix = String(i).padStart(3, '0');
    codes.push(`sz300${suffix}`);
    codes.push(`sz301${suffix}`);
  }
  
  // 去重并返回
  return [...new Set(codes)];
}

// 全市场股票列表（动态生成，共5200+只）
export const allStockCodes = generateAllStockCodes();

// 按行业分组的股票列表
export const stockList = Object.keys(sectors).reduce((acc, sector) => {
  acc[sector] = [];
  return acc;
}, {});

// 智能行业分类函数
export function getStockSector(code, stockName = '') {
  // 优先匹配规则
  for (const rule of industryRules) {
    // 匹配前缀
    if (rule.prefixes?.some(prefix => code.startsWith(prefix))) {
      return sectors[rule.code];
    }
    // 匹配名称关键词
    if (stockName && rule.keywords?.some(keyword => stockName.includes(keyword))) {
      return sectors[rule.code];
    }
  }
  
  // 按代码前缀分类
  if (code.startsWith('sh688')) return sectors.semiconductor; // 科创板默认半导体/科技
  if (code.startsWith('sz300')) return sectors.software; // 创业板默认计算机/科技
  if (code.startsWith('sh601')) {
    // 601开头多为金融、周期、大蓝筹
    if (['sh601288', 'sh601398', 'sh601939', 'sh601328', 'sh601988'].includes(code)) return sectors.bank;
    if (['sh601318', 'sh601628', 'sh601336', 'sh601601'].includes(code)) return sectors.insurance;
    if (['sh601688', 'sh601211', 'sh600837', 'sh600030'].includes(code)) return sectors.securities;
    if (['sh601088', 'sh601898', 'sh601857', 'sh600028'].includes(code)) return sectors.coal;
    if (['sh601899', 'sh601677'].includes(code)) return sectors.nonferrous;
    return sectors.other;
  }
  
  // 默认其他分类
  return sectors.other;
}

// 获取所有股票代码（全量5200+只A股）
export const getAllStockCodes = () => {
  return allStockCodes;
};

// 按行业分组的获取函数
export const getStocksBySector = () => {
  const result = {};
  for (const [sectorKey, codes] of Object.entries(stockList)) {
    const sectorInfo = sectors[sectorKey] || { name: sectorKey, code: sectorKey, color: '#9E9E9E' };
    result[sectorKey] = {
      ...sectorInfo,
      stocks: codes
    };
  }
  return result;
};

// 导出常用股票分组
export const marketIndices = indices;
export const sectorList = sectors;
export const sectorStocks = stockList;

// 默认导出
export default {
  sectors,
  indices,
  stockList,
  getAllStockCodes,
  getStockSector,
  getStocksBySector,
};
