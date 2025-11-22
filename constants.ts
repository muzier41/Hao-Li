import { ApplicationStatus, CompanyType, EventType } from './types';

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Applied]: '#8E8E93', // Gray
  [ApplicationStatus.WrittenTest]: '#AF52DE', // Purple
  [ApplicationStatus.AIInterview]: '#5856D6', // Indigo
  [ApplicationStatus.FirstRound]: '#007AFF', // Blue
  [ApplicationStatus.SecondRound]: '#5AC8FA', // Light Blue
  [ApplicationStatus.HRRound]: '#FF9500', // Orange
  [ApplicationStatus.Offer]: '#34C759', // Green
  [ApplicationStatus.Rejected]: '#FF3B30', // Red
};

export const COMPANY_TYPE_COLORS: Record<CompanyType, string> = {
  [CompanyType.Internet]: '#007AFF',
  [CompanyType.StateOwned]: '#FF3B30',
  [CompanyType.Foreign]: '#AF52DE',
  [CompanyType.Consulting]: '#FF9500',
  [CompanyType.Startup]: '#34C759',
  [CompanyType.Other]: '#8E8E93',
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  [EventType.Interview]: '#007AFF', // Blue
  [EventType.TestOrAI]: '#AF52DE', // Purple
  [EventType.Other]: '#8E8E93', // Gray
};

// Chinese Localization Mappings
export const STATUS_LABELS_CN: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Applied]: '已投递/初筛',
  [ApplicationStatus.WrittenTest]: '笔试/测评',
  [ApplicationStatus.AIInterview]: 'AI 面试',
  [ApplicationStatus.FirstRound]: '一面',
  [ApplicationStatus.SecondRound]: '二面',
  [ApplicationStatus.HRRound]: 'HR 面',
  [ApplicationStatus.Offer]: '已拿 Offer',
  [ApplicationStatus.Rejected]: '已挂/人才库',
};

export const COMPANY_TYPE_LABELS_CN: Record<CompanyType, string> = {
  [CompanyType.StateOwned]: '国企',
  [CompanyType.Foreign]: '外企',
  [CompanyType.Internet]: '互联网',
  [CompanyType.Consulting]: '咨询',
  [CompanyType.Startup]: '初创',
  [CompanyType.Other]: '其他',
};

export const EVENT_TYPE_LABELS_CN: Record<EventType, string> = {
  [EventType.Interview]: '面试',
  [EventType.TestOrAI]: '测试/AI面试',
  [EventType.Other]: '其他',
};

// Data from CSV Import
export const MOCK_INITIAL_DATA = [
  { id: '1', company: '华为', position: '校招岗位 (深圳/东莞)', applyDate: '2025-09-02T15:24:00.000Z', industry: '制造业', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '深圳 东莞' },
  { id: '2', company: '华为', position: '校招岗位 (上海/北京)', applyDate: '2025-09-03T10:48:00.000Z', industry: '制造业', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '上海 北京' },
  { id: '3', company: '美团', position: '校招岗位', applyDate: '2025-09-03T10:49:00.000Z', industry: '互联网', companyType: CompanyType.Internet, status: ApplicationStatus.Rejected, note: '上海 北京' },
  { id: '4', company: '小鹏汽车', position: '校招岗位', applyDate: '2025-09-03T10:49:00.000Z', industry: '新能源汽车', companyType: CompanyType.Other, status: ApplicationStatus.AIInterview, note: '上海' },
  { id: '5', company: '小鹏汽车', position: '校招岗位 (人才库)', applyDate: '2025-09-03T10:49:00.000Z', industry: '新能源汽车', companyType: CompanyType.Other, status: ApplicationStatus.Rejected, note: '上海' },
  { id: '6', company: '荣耀', position: '校招岗位', applyDate: '2025-09-03T10:49:00.000Z', industry: '制造业', companyType: CompanyType.Other, status: ApplicationStatus.FirstRound, note: '待定' },
  { id: '7', company: '凡岛', position: '校招岗位', applyDate: '2025-09-03T10:49:00.000Z', industry: '快销', companyType: CompanyType.Other, status: ApplicationStatus.Offer, note: '广州, 工资高，但业务一般想干' },
  { id: '8', company: '货拉拉', position: '校招岗位', applyDate: '2025-09-03T10:49:00.000Z', industry: '交通物流', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '待定' },
  { id: '9', company: '中通快递', position: '校招岗位', applyDate: '2025-09-03T10:49:00.000Z', industry: '交通物流', companyType: CompanyType.Other, status: ApplicationStatus.FirstRound, note: '上海' },
  { id: '10', company: '宝洁', position: 'Customer Collaboration Planner', applyDate: '2025-09-03T10:49:00.000Z', industry: '快销', companyType: CompanyType.Foreign, status: ApplicationStatus.Rejected, note: '上海' },
  { id: '11', company: '诺华', position: '校招岗位', applyDate: '2025-09-03T10:49:00.000Z', industry: '医药', companyType: CompanyType.Foreign, status: ApplicationStatus.Applied, note: '上海 苏州' },
  { id: '12', company: '宁德时代', position: '校招岗位', applyDate: '2025-09-03T10:49:00.000Z', industry: '新能源汽车', companyType: CompanyType.Other, status: ApplicationStatus.Rejected, note: '宁德' },
  { id: '13', company: '浙江我武生物', position: '医药代表', applyDate: '2025-09-03T10:49:00.000Z', industry: '医药', companyType: CompanyType.Other, status: ApplicationStatus.Offer, note: '上海 苏州' },
  { id: '14', company: '上汽智已', position: '校招岗位', applyDate: '2025-09-03T10:58:00.000Z', industry: '新能源汽车', companyType: CompanyType.StateOwned, status: ApplicationStatus.Applied, note: '待定' },
  { id: '15', company: '仅三生物', position: '校招岗位', applyDate: '2025-09-03T12:10:00.000Z', industry: '医药', companyType: CompanyType.Other, status: ApplicationStatus.Rejected, note: '南京, 问了很多关于创新的东西，对我没什么兴趣' },
  { id: '16', company: '基恩士', position: '校招岗位', applyDate: '2025-09-05T15:51:00.000Z', industry: '制造业', companyType: CompanyType.Foreign, status: ApplicationStatus.Rejected, note: '待定' },
  { id: '17', company: '零跑汽车', position: '校招岗位', applyDate: '2025-09-05T17:05:00.000Z', industry: '新能源汽车', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '杭州' },
  { id: '18', company: '嘉士伯', position: '校招岗位', applyDate: '2025-09-05T17:11:00.000Z', industry: '零售', companyType: CompanyType.Foreign, status: ApplicationStatus.AIInterview, note: '成都' },
  { id: '19', company: '上汽通用', position: '校招岗位', applyDate: '2025-09-05T17:18:00.000Z', industry: '汽车', companyType: CompanyType.StateOwned, status: ApplicationStatus.Applied, note: '上海' },
  { id: '20', company: '雀巢', position: '校招岗位', applyDate: '2025-09-12T01:13:00.000Z', industry: '零售', companyType: CompanyType.Foreign, status: ApplicationStatus.AIInterview, note: '北京, 宠物食品的公司，比较好' },
  { id: '21', company: '同花顺', position: '校招岗位', applyDate: '2025-09-12T01:40:00.000Z', industry: '金融', companyType: CompanyType.Internet, status: ApplicationStatus.Rejected, note: '杭州, 电话面试寄了' },
  { id: '22', company: '影石', position: '校招岗位', applyDate: '2025-09-12T02:00:00.000Z', industry: '零售', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '深圳' },
  { id: '23', company: '百事中国', position: '校招岗位', applyDate: '2025-09-14T00:37:00.000Z', industry: '零售', companyType: CompanyType.Foreign, status: ApplicationStatus.Rejected, note: '上海, 投递繁琐' },
  { id: '24', company: '携程', position: '校招岗位', applyDate: '2025-09-15T00:10:00.000Z', industry: '互联网', companyType: CompanyType.Internet, status: ApplicationStatus.Rejected, note: '上海, 只能投一个' },
  { id: '25', company: '吉比特雷霆', position: '校招岗位', applyDate: '2025-09-15T00:43:00.000Z', industry: '游戏', companyType: CompanyType.Internet, status: ApplicationStatus.Rejected, note: '深圳, 没上传游戏经验挂了' },
  { id: '26', company: '礼来', position: '校招岗位', applyDate: '2025-09-21T15:22:00.000Z', industry: '医药', companyType: CompanyType.Foreign, status: ApplicationStatus.Applied, note: '上海, 英语要求高' },
  { id: '27', company: '拼多多', position: '校招岗位', applyDate: '2025-09-21T15:35:00.000Z', industry: '零售', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '上海' },
  { id: '28', company: '苹果', position: 'Global Sourcing Manager', applyDate: '2025-09-21T22:25:00.000Z', industry: '互联网', companyType: CompanyType.Foreign, status: ApplicationStatus.Applied, note: '上海, 感觉很难' },
  { id: '29', company: '广汽', position: '校招岗位', applyDate: '2025-09-21T23:24:00.000Z', industry: '汽车', companyType: CompanyType.StateOwned, status: ApplicationStatus.WrittenTest, note: '广州, 需轮岗销售' },
  { id: '30', company: '腾讯', position: '校招岗位', applyDate: '2025-09-23T16:18:00.000Z', industry: '互联网', companyType: CompanyType.Internet, status: ApplicationStatus.WrittenTest, note: '上海' },
  { id: '31', company: '迈瑞', position: '校招岗位', applyDate: '2025-09-23T16:46:00.000Z', industry: '医药', companyType: CompanyType.Other, status: ApplicationStatus.WrittenTest, note: '上海' },
  { id: '32', company: '百胜集团', position: '肯德基品牌营运管培生', applyDate: '2025-09-25T14:37:00.000Z', industry: '快销', companyType: CompanyType.Foreign, status: ApplicationStatus.AIInterview, note: '上海, 情景模拟多' },
  { id: '33', company: '沃尔玛中国', position: '校招岗位', applyDate: '2025-09-25T17:07:00.000Z', industry: '快销', companyType: CompanyType.Foreign, status: ApplicationStatus.WrittenTest, note: '深圳' },
  { id: '34', company: '蒙牛', position: '校招岗位', applyDate: '2025-09-30T13:51:00.000Z', industry: '快销', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '上海' }
];