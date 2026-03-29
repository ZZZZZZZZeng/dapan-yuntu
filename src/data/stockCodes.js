// A股全市场股票代码及行业分类
// 数据来源：按行业板块分类的A股全市场股票

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
  petroleum: { name: '石油石化', code: 'petroleum', color: '#FF9800' }, // 新增石油石化板块
  chemical: { name: '化工', code: 'chemical', color: '#43A047' },
  building: { name: '建筑', code: 'building', color: '#FB8C00' },
  realEstate: { name: '房地产', code: 'realEstate', color: '#E53935' },
  
  // 交通物流
  transportation: { name: '交通运输', code: 'transportation', color: '#8E24AA' },
  logistics: { name: '物流', code: 'logistics', color: '#F4511E' },
  port: { name: '港口', code: 'port', color: '#00ACC1' },
  
  // 其他
  media: { name: '传媒', code: 'media', color: '#3949AB' },
  computer: { name: '计算机设备', code: 'computer', color: '#7CB342' },
  environmental: { name: '环保', code: 'environmental', color: '#5E35B1' },
  agriculture: { name: '农业', code: 'agriculture', color: '#1E88E5' },
  commerce: { name: '商业贸易', code: 'commerce', color: '#43A047' },
  textile: { name: '纺织服装', code: 'textile', color: '#FB8C00' },
  lightIndustry: { name: '轻工制造', code: 'lightIndustry', color: '#E53935' },
  leisure: { name: '休闲服务', code: 'leisure', color: '#8E24AA' },
  electronics: { name: '电子', code: 'electronics', color: '#F4511E' },
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

// 获取行业股票代码列表的辅助函数
// 由于全市场股票数量庞大，这里按行业维护核心股票列表
export const stockList = {
  // 石油石化
  petroleum: [
    'sh601857', 'sh600028', 'sh601808', 'sh600583', 'sh6000688',
    'sh600339', 'sh600387', 'sh600179', 'sz000096', 'sz002207',
    'sh600688', 'sh600546', 'sz000554', 'sz000637', 'sz000819'
  ],
  
  // 银行
  bank: [
    'sh601398', 'sh601288', 'sh601939', 'sh600036',
    'sh601988', 'sh601328', 'sh601166', 'sh600016', 'sh601998',
    'sh601818', 'sh600919', 'sh600926', 'sh601229', 'sh601169',
    'sh601009', 'sh601128', 'sh600908', 'sh601577', 'sh601665',
    'sh600928', 'sh601187', 'sh601860', 'sh601528', 'sh002807',
    'sh601963', 'sh600015', 'sh601077', 'sh601838', 'sh002839',
    'sh601997', 'sh600621', 'sh002936', 'sh601825', 'sh603323',
    'sh600927', 'sh601056', 'sh001227', 'sh603079', 'sz002966',
    'sz002958', 'sz002948', 'sz002946', 'sz002944', 'sz002968',
    'sz002961', 'sz002977', 'sz003037'
  ],
  
  // 白酒
  liquor: [
    'sh600519', 'sz000858', 'sh600702', 'sz000568', 'sh600809',
    'sh600276', 'sh000596', 'sz002304', 'sh603369', 'sh600197',
    'sh600779', 'sh600559', 'sh600199', 'sz000860', 'sh603198',
    'sh600572', 'sh600365', 'sz002646', 'sz000752', 'sh600084',
    'sh600238', 'sh600543', 'sz002461', 'sh600300', 'sh600371',
    'sh600090', 'sz200596'
  ],
  
  // 新能源
  newEnergy: [
    'sz002594', 'sh601012', 'sz300750', 'sh601669', 'sh600438',
    'sh601727', 'sh601985', 'sz002129', 'sz000591', 'sh601016',
    'sh600483', 'sz002202', 'sz300274', 'sh601877', 'sz000883',
    'sh600011', 'sh600900', 'sz000009', 'sh601615', 'sz002709',
    'sh601992', 'sh601868', 'sh600000', 'sz300014', 'sh601558',
    'sz002459', 'sz002340', 'sh600089', 'sh601899', 'sz300068',
    'sz002074', 'sh600517', 'sz300316', 'sh600795', 'sh600406',
    'sh600642', 'sh600863', 'sh600021', 'sz300118', 'sh600674'
  ],
  
  // 半导体
  semiconductor: [
    'sh688981', 'sh603501', 'sh603160', 'sh688012', 'sh600584',
    'sz002049', 'sh688008', 'sh603986', 'sh600171', 'sh688536',
    'sh688126', 'sh688396', 'sh688595', 'sh688019', 'sh688052',
    'sh688123', 'sh688521', 'sh688256', 'sh688072', 'sh688200',
    'sh688385', 'sh688347', 'sh688661', 'sh688141', 'sh688037',
    'sh688262', 'sh688630', 'sh688082', 'sh688220', 'sh688702',
    'sh688153', 'sh688234', 'sh688206', 'sh688403', 'sh688601',
    'sh688279', 'sh688146', 'sh688172', 'sh688591', 'sh688107'
  ],
  
  // 医药
  medicine: [
    'sh600276', 'sh600436', 'sh603259', 'sz000538', 'sh600196',
    'sh600332', 'sz000963', 'sz002001', 'sh600085', 'sh603392',
    'sh600079', 'sz300003', 'sh600521', 'sz300122', 'sh600380',
    'sh688180', 'sh603127', 'sh600420', 'sh603590', 'sz300142',
    'sh600535', 'sh688578', 'sz002007', 'sh688687', 'sz300347',
    'sh688331', 'sh688235', 'sh688176', 'sh688202', 'sh688266',
    'sh688177', 'sh688062', 'sh688336', 'sh688197', 'sh688302'
  ],
  
  // 科技/软件
  software: [
    'sh600570', 'sz000938', 'sh600588', 'sh603383', 'sz002230',
    'sz000977', 'sh603019', 'sz002236', 'sh601360', 'sh600845',
    'sh600728', 'sh600536', 'sh000938', 'sz300033', 'sh603927',
    'sh688561', 'sh688158', 'sh688318', 'sh688039', 'sh688066',
    'sh688088', 'sh688369', 'sh688787', 'sh688551', 'sh688110',
    'sh688232', 'sh688292', 'sh688152', 'sh688489', 'sh688246'
  ],
  
  // 汽车
  auto: [
    'sh600104', 'sz000625', 'sh601633', 'sh601238', 'sz002594',
    'sh600660', 'sz000338', 'sh603596', 'sh603290', 'sh600066',
    'sh000887', 'sz002048', 'sh603035', 'sh600686', 'sz002126',
    'sz002920', 'sh600742', 'sh601689', 'sh600933', 'sh603197',
    'sh600297', 'sh603306', 'sh605333', 'sz300258', 'sz300073',
    'sh603179', 'sh601717', 'sz002363', 'sz002085', 'sh600178'
  ],
  
  // 其他行业补充
  securities: [
    'sh600030', 'sh601688', 'sh600837', 'sh601211', 'sh600999',
    'sh601881', 'sh601377', 'sh601108', 'sh601555', 'sh601198',
    'sh601901', 'sh601788', 'sh600109', 'sh601990', 'sh600958',
    'sh601236', 'sh601162', 'sh002736', 'sh601696', 'sh600369',
    'sh601878', 'sz000166', 'sz000776', 'sz000728', 'sz000750'
  ],
  
  food: [
    'sh600887', 'sz000895', 'sh600298', 'sh603288', 'sz000860',
    'sh600872', 'sh603517', 'sh600702', 'sh603369', 'sh600197',
    'sh600779', 'sh600559', 'sh600199', 'sh603198', 'sh600572',
    'sh600365', 'sz002646', 'sh600084', 'sh600238', 'sh600543',
    'sz002461', 'sh600300', 'sh600371', 'sh600090', 'sz200596'
  ],
  
  homeAppliance: [
    'sh600690', 'sz000333', 'sz000651', 'sh600839', 'sh603486',
    'sz002032', 'sh600060', 'sh603868', 'sz002508', 'sh603515',
    'sh603355', 'sz002242', 'sh603677', 'sh688169', 'sh603579',
    'sh688696', 'sh688007', 'sh688793', 'sh688400', 'sh688062'
  ],
  
  medicalDevice: [
    'sh600276', 'sh600436', 'sh603259', 'sz000538', 'sh600196',
    'sh600332', 'sz000963', 'sz002001', 'sh600085', 'sh603392',
    'sh600079', 'sz300003', 'sh600521', 'sz300122', 'sh600380'
  ],
  
  battery: [
    'sz002594', 'sz300750', 'sz002709', 'sz002074', 'sh603659',
    'sz300014', 'sh600884', 'sz002812', 'sh600110', 'sh600549',
    'sz002460', 'sz002466', 'sh603799', 'sz300073', 'sz300769',
    'sh688005', 'sz002850', 'sh600499', 'sh688567', 'sh688779'
  ],
  
  photovoltaic: [
    'sh601012', 'sh600438', 'sz300274', 'sh601877', 'sh601669',
    'sh601985', 'sz000591', 'sz002129', 'sh601016', 'sh600483',
    'sz002202', 'sh600011', 'sh600900', 'sh601615', 'sh601992',
    'sh601868', 'sh601558', 'sz002459', 'sh600089', 'sh601899'
  ],
  
  autoParts: [
    'sh600104', 'sz000625', 'sh601633', 'sh601238', 'sh600660',
    'sz000338', 'sh603596', 'sh603290', 'sh600066', 'sh000887',
    'sz002048', 'sh603035', 'sh600686', 'sz002126', 'sz002920',
    'sh600742', 'sh601689', 'sh600933', 'sh603197', 'sh600297'
  ],
  
  machinery: [
    'sh601766', 'sh601988', 'sh600031', 'sh600150', 'sh601100',
    'sh600580', 'sh601727', 'sh600893', 'sh601669', 'sh601989',
    'sh600482', 'sh600760', 'sh601608', 'sh600372', 'sh600038',
    'sh600495', 'sh600528', 'sh600118', 'sh600973', 'sh600171'
  ],
  
  defense: [
    'sh600893', 'sh600372', 'sh600038', 'sh600760', 'sh600118',
    'sh600495', 'sh600343', 'sh600677', 'sh600967', 'sh600562',
    'sh600862', 'sh600391', 'sh600879', 'sh600435', 'sh600184',
    'sh600685', 'sh600698', 'sh600990', 'sh600150', 'sh600482'
  ],
  
  steel: [
    'sh600019', 'sh600010', 'sh601003', 'sh000898', 'sh600507',
    'sh600808', 'sh600581', 'sh600282', 'sh600782', 'sh600022',
    'sh601005', 'sh600569', 'sh600231', 'sh600117', 'sh600126',
    'sh600532', 'sh600307', 'sh600399', 'sh601969', 'sh600165'
  ],
  
  nonferrous: [
    'sh600362', 'sh601899', 'sh601600', 'sh601168', 'sh000878',
    'sh600111', 'sh601677', 'sh600219', 'sh600549', 'sh600489',
    'sh600497', 'sh600888', 'sh600259', 'sh601212', 'sh600330',
    'sh601609', 'sh601020', 'sh600595', 'sh600768', 'sh000060'
  ],
  
  coal: [
    'sh601088', 'sh600157', 'sh601225', 'sh600348', 'sh600508',
    'sh601699', 'sh601001', 'sh601898', 'sh601015', 'sh600971',
    'sh600395', 'sh600408', 'sh601666', 'sh601101', 'sh600397',
    'sh600792', 'sh600403', 'sh601699', 'sh600179', 'sh600725'
  ],
  
  chemical: [
    'sh600309', 'sh600028', 'sh600176', 'sh000792', 'sh601233',
    'sh002092', 'sh601678', 'sh000830', 'sh600409', 'sh600160',
    'sh600486', 'sh600623', 'sh600315', 'sh600803', 'sh600727',
    'sh002470', 'sh601216', 'sh600141', 'sh000553', 'sh600596'
  ],
  
  building: [
    'sh601668', 'sh601390', 'sh601186', 'sh601800', 'sh601117',
    'sh601669', 'sh601618', 'sh600170', 'sh600820', 'sh600496',
    'sh600039', 'sh600284', 'sh600853', 'sh601789', 'sh600266',
    'sh600067', 'sh600263', 'sh600209', 'sh601611', 'sh600715'
  ],
  
  realEstate: [
    'sh000002', 'sh600048', 'sh001979', 'sh600606', 'sh600383',
    'sh600340', 'sh000031', 'sh600208', 'sh600177', 'sh600663',
    'sh600639', 'sh600895', 'sh600848', 'sh600736', 'sh600649',
    'sh600658', 'sh600622', 'sh600665', 'sh600684', 'sh600638'
  ],
  
  transportation: [
    'sh601111', 'sh600115', 'sh601021', 'sh600029', 'sh600221',
    'sh601006', 'sh601333', 'sh600125', 'sh600033', 'sh600377',
    'sh600350', 'sh600012', 'sh600020', 'sh601107', 'sh600548',
    'sh600106', 'sh600269', 'sh600035', 'sh600017', 'sh600190'
  ],
  
  logistics: [
    'sh600233', 'sh002352', 'sh600153', 'sh601598', 'sh603056',
    'sh600787', 'sh601156', 'sh600179', 'sh600057', 'sh002120',
    'sh600704', 'sh601000', 'sh600125', 'sh600180', 'sh600017',
    'sh002468', 'sh603066', 'sh600794', 'sh603117', 'sh600279'
  ],
  
  port: [
    'sh601018', 'sh601880', 'sh601228', 'sh600717', 'sh600018',
    'sh601008', 'sh601326', 'sh600190', 'sh000507', 'sh600317',
    'sh601000', 'sh600017', 'sh600798', 'sh600179', 'sh601866',
    'sh600428', 'sh600026', 'sh600896', 'sh600125', 'sh600020'
  ],
  
  media: [
    'sh600088', 'sh300413', 'sh600373', 'sh600831', 'sh601928',
    'sh600637', 'sh300251', 'sh600386', 'sh600757', 'sh300027',
    'sh600977', 'sh002131', 'sh601949', 'sh600715', 'sh600136',
    'sh601595', 'sh300182', 'sh300058', 'sh300071', 'sh300336'
  ],
  
  computer: [
    'sh000066', 'sh600100', 'sh000938', 'sh600570', 'sh000977',
    'sh603019', 'sh600728', 'sh600845', 'sh600536', 'sh600601',
    'sh600756', 'sh000021', 'sh600410', 'sh600850', 'sh600800',
    'sh600707', 'sh600288', 'sh600076', 'sh600667', 'sh600105'
  ],
  
  environmental: [
    'sh600008', 'sh601158', 'sh600168', 'sh000544', 'sh600292',
    'sh603588', 'sh600323', 'sh601200', 'sh601827', 'sh000598',
    'sh600461', 'sh603797', 'sh600874', 'sh603126', 'sh300070',
    'sh601330', 'sh000685', 'sh600388', 'sh603903', 'sh603200'
  ],
  
  agriculture: [
    'sh600598', 'sh000998', 'sh002714', 'sh600737', 'sh600866',
    'sh000876', 'sh002299', 'sh600965', 'sh002157', 'sh002385',
    'sh600201', 'sh600313', 'sh002458', 'sh002234', 'sh600097',
    'sh600467', 'sh600354', 'sh002746', 'sh002311', 'sh002041'
  ],
  
  commerce: [
    'sh600415', 'sh600827', 'sh601828', 'sh600122', 'sh600729',
    'sh600755', 'sh600694', 'sh600697', 'sh600861', 'sh600628',
    'sh000987', 'sh002251', 'sh600828', 'sh600278', 'sh600981',
    'sh600058', 'sh600710', 'sh002419', 'sh000564', 'sh002336'
  ],
  
  textile: [
    'sh600295', 'sh601339', 'sh002042', 'sh600987', 'sh000726',
    'sh600220', 'sh600400', 'sh600493', 'sh002144', 'sh002029',
    'sh600630', 'sh600156', 'sh000850', 'sh600107', 'sh600370',
    'sh002083', 'sh002394', 'sh002003', 'sh002087', 'sh600448'
  ],
  
  lightIndustry: [
    'sh600612', 'sh000587', 'sh002345', 'sh600439', 'sh002572',
    'sh603833', 'sh600978', 'sh603801', 'sh603180', 'sh600337',
    'sh603898', 'sh600076', 'sh603385', 'sh603610', 'sh603801',
    'sh603816', 'sh603208', 'sh603801', 'sh603587', 'sh603326'
  ],
  
  leisure: [
    'sh600754', 'sh600258', 'sh601888', 'sh600138', 'sh600593',
    'sh000524', 'sh600054', 'sh600749', 'sh002033', 'sh000610',
    'sh600706', 'sh002059', 'sh600640', 'sh002186', 'sh002306',
    'sh000721', 'sh002159', 'sh300144', 'sh300178', 'sh600880'
  ],
  
  electronics: [
    'sh600703', 'sh000725', 'sh000100', 'sh601138', 'sh002415',
    'sh002236', 'sh603501', 'sh600460', 'sh603160', 'sh002049',
    'sh600584', 'sh600171', 'sh300014', 'sh000050', 'sh600363',
    'sh002371', 'sh600206', 'sh603933', 'sh002456', 'sh600237'
  ],
  
  insurance: [
    'sh601318', 'sh601628', 'sh601336', 'sh601601', 'sh600030',
    'sh601688', 'sh601211', 'sh600837', 'sh600999', 'sh601881',
    'sh601377', 'sh601108', 'sh601555', 'sh601198', 'sh601901'
  ],
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
  // 兜底规则，避免归错
  if (['sh601857', 'sh600028', 'sh601808'].includes(code)) {
    return sectors.petroleum; // 强制石油石化板块
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
