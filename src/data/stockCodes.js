// A股全市场股票代码及行业分类
// 数据来源：东方财富全市场A股数据，共100只股票

// 股票代码前缀规则：
// - 沪市A股：600xxx, 601xxx, 603xxx, 605xxx, 688xxx(科创)
// - 深市A股：000xxx(主板), 002xxx(中小板), 300xxx(创业板), 301xxx(创业板)
// - 北交所：8xxxxx, 4xxxxx

// 行业板块分类
export const sectors = {
  // 金融
  bank: { name: '银行', code: 'bank', color: '#1E88E5' },
  insurance: { name: '保险', code: 'insurance', color: '#43A047' },
  securities: { name: '证券', code: 'securities', color: '#FB8C00' },
  
  // 消费
  liquor: { name: '白酒', code: 'liquor', color: '#E53935' },
  food: { name: '食品加工', code: 'food', color: '#8E24AA' },
  homeAppliance: { name: '家电', code: 'homeAppliance', color: '#F4511E' },
  
  // 医药
  medicine: { name: '医药', code: 'medicine', color: '#00ACC1' },
  medicalDevice: { name: '医疗器械', code: 'medicalDevice', color: '#3949AB' },
  
  // 科技
  semiconductor: { name: '半导体', code: 'semiconductor', color: '#7CB342' },
  software: { name: '软件', code: 'software', color: '#5E35B1' },
  communication: { name: '通信', code: 'communication', color: '#1E88E5' },
  electronics: { name: '电子', code: 'electronics', color: '#F4511E' },
  computer: { name: '计算机设备', code: 'computer', color: '#7CB342' },
  
  // 新能源
  newEnergy: { name: '新能源', code: 'newEnergy', color: '#43A047' },
  battery: { name: '锂电池', code: 'battery', color: '#FB8C00' },
  photovoltaic: { name: '光伏', code: 'photovoltaic', color: '#E53935' },
  
  // 制造
  auto: { name: '汽车', code: 'auto', color: '#8E24AA' },
  autoParts: { name: '汽车零部件', code: 'autoParts', color: '#F4511E' },
  machinery: { name: '机械设备', code: 'machinery', color: '#00ACC1' },
  defense: { name: '军工', code: 'defense', color: '#3949AB' },
  
  // 周期
  steel: { name: '钢铁', code: 'steel', color: '#7CB342' },
  nonferrous: { name: '有色金属', code: 'nonferrous', color: '#5E35B1' },
  coal: { name: '煤炭', code: 'coal', color: '#1E88E5' },
  petroleum: { name: '石油石化', code: 'petroleum', color: '#FF9800' },
  chemical: { name: '化工', code: 'chemical', color: '#43A047' },
  building: { name: '建筑', code: 'building', color: '#FB8C00' },
  realEstate: { name: '房地产', code: 'realEstate', color: '#E53935' },
  
  // 交通物流
  transportation: { name: '交通运输', code: 'transportation', color: '#8E24AA' },
  logistics: { name: '物流', code: 'logistics', color: '#F4511E' },
  port: { name: '港口', code: 'port', color: '#00ACC1' },
  
  // 其他
  media: { name: '传媒', code: 'media', color: '#3949AB' },
  environmental: { name: '环保', code: 'environmental', color: '#5E35B1' },
  agriculture: { name: '农业', code: 'agriculture', color: '#1E88E5' },
  commerce: { name: '商业贸易', code: 'commerce', color: '#43A047' },
  textile: { name: '纺织服装', code: 'textile', color: '#FB8C00' },
  lightIndustry: { name: '轻工制造', code: 'lightIndustry', color: '#E53935' },
  leisure: { name: '休闲服务', code: 'leisure', color: '#8E24AA' },

  // 其他
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
// 全市场股票列表，共100只
export const stockList = {
  "bank": [],
  "insurance": [],
  "securities": [],
  "liquor": [],
  "food": [],
  "homeAppliance": [],
  "medicine": [
    "sh688336",
    "sz002675",
    "sh603122",
    "sh603716",
    "sh603538",
    "sh600513",
    "sz002370",
    "sh600488",
    "sz002038",
    "sz300683",
    "sz301239"
  ],
  "medicalDevice": [
    "sh688677",
    "sz002432",
    "sz300246"
  ],
  "semiconductor": [
    "sh688693",
    "sh603061"
  ],
  "software": [
    "sz301153",
    "sh600602"
  ],
  "communication": [
    "sh600487",
    "sh601869",
    "sh600345",
    "sh600105"
  ],
  "electronics": [
    "sz002222",
    "sz301321"
  ],
  "computer": [
    "sh688288"
  ],
  "newEnergy": [
    "sh603618",
    "sh603897",
    "sz002980",
    "sh603016",
    "sh605222"
  ],
  "battery": [
    "sz002850",
    "sh600152"
  ],
  "photovoltaic": [
    "sh603778",
    "sz002309"
  ],
  "auto": [],
  "autoParts": [
    "sz301005",
    "sh603358",
    "sh603239"
  ],
  "machinery": [
    "sh688308",
    "sh688257",
    "sz002686",
    "sz001400",
    "sh600343",
    "sz003036",
    "sz301018",
    "sh603356"
  ],
  "defense": [],
  "steel": [],
  "nonferrous": [
    "sz002501",
    "sz002578",
    "sh601388",
    "sz002160",
    "sz002532",
    "sz000807",
    "sh600219",
    "sz002149",
    "sz300337"
  ],
  "coal": [],
  "petroleum": [],
  "chemical": [
    "sz002810"
  ],
  "building": [],
  "realEstate": [
    "sh600724"
  ],
  "transportation": [],
  "logistics": [],
  "port": [],
  "media": [],
  "environmental": [
    "sz300385",
    "sz300961",
    "sh688156"
  ],
  "agriculture": [
    "sz300313",
    "sz000048"
  ],
  "commerce": [],
  "textile": [
    "sz002634"
  ],
  "lightIndustry": [
    "sh603272"
  ],
  "leisure": [],
  "other": [
    "sz920188",
    "sz920078",
    "sz300900",
    "sz301008",
    "sz920576",
    "sz300300",
    "sz301232",
    "sz301216",
    "sh600502",
    "sz000753",
    "sh600359",
    "sh600135",
    "sz000592",
    "sh600955",
    "sz003042",
    "sh603601",
    "sz000890",
    "sh603256",
    "sz000008",
    "sh600539",
    "sh601068",
    "sh603585",
    "sh600996",
    "sh603017",
    "sz002361",
    "sh600127",
    "sh688272",
    "sz301306",
    "sz300920",
    "sz301280",
    "sh600746",
    "sh600845",
    "sh600598",
    "sz300461",
    "sh600528",
    "sz301048",
    "sz002858"
  ]
};

// 获取所有股票代码（去重）
export const getAllStockCodes = () => {
  const allCodes = new Set();
  Object.values(stockList).forEach(codes => {
    codes.forEach(code => allCodes.add(code));
  });
  return Array.from(allCodes);
};

// 根据股票代码查找所属行业
export const getStockSector = (code) => {
  for (const [sector, codes] of Object.entries(stockList)) {
    if (codes.includes(code)) {
      return sectors[sector] || { name: '其他', code: 'other', color: '#9E9E9E' };
    }
  }
  return { name: '其他', code: 'other', color: '#9E9E9E' };
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
