
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

// Data from User Excel Import
export const MOCK_INITIAL_DATA = [
  { id: '1', company: '健友股份', position: '国际招商', applyDate: '2025-10-17T10:00:00.000Z', industry: '生物医疗', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '2', company: '华住集团', position: '市场部管培生', applyDate: '2025-10-18T10:00:00.000Z', industry: '旅游', companyType: CompanyType.Other, status: ApplicationStatus.WrittenTest, note: '测试: 2025/10/25' },
  { id: '3', company: '京东', position: '采销', applyDate: '2025-10-18T10:00:00.000Z', industry: '电商', companyType: CompanyType.Internet, status: ApplicationStatus.WrittenTest, note: '测试: 2025/10/20' },
  { id: '4', company: '海康威视', position: '产品市场专员', applyDate: '2025-10-18T10:00:00.000Z', industry: '制造业', companyType: CompanyType.Other, status: ApplicationStatus.WrittenTest, note: '测试: 2025/10/25' },
  { id: '5', company: '格力电器', position: '品牌宣传', applyDate: '2025-10-19T10:00:00.000Z', industry: '机械零售', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '6', company: '元气森林', position: '数字营销', applyDate: '2025-10-19T10:00:00.000Z', industry: '零售', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '7', company: '汇川技术', position: '市场计划工程师', applyDate: '2025-10-19T10:00:00.000Z', industry: '通讯/半导体', companyType: CompanyType.Other, status: ApplicationStatus.WrittenTest, note: '测试: 2025/11/3' },
  { id: '8', company: '零跑汽车', position: '商务采购工程师', applyDate: '2025-10-19T10:00:00.000Z', industry: '汽车', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '9', company: '长城集团', position: '区域市场bp', applyDate: '2025-10-21T10:00:00.000Z', industry: '汽车', companyType: CompanyType.Other, status: ApplicationStatus.WrittenTest, note: '测试: 2025/10/28' },
  { id: '10', company: '海尔集团', position: '产品企划经理', applyDate: '2025-10-21T10:00:00.000Z', industry: '制造业', companyType: CompanyType.Other, status: ApplicationStatus.WrittenTest, note: '测试: 2025/10/24' },
  { id: '11', company: '哈啰', position: '内容营销', applyDate: '2025-10-21T10:00:00.000Z', industry: '制造业', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '' },
  { id: '12', company: '娇韵诗', position: '媒介策划Media', applyDate: '2025-10-21T10:00:00.000Z', industry: '日化', companyType: CompanyType.Foreign, status: ApplicationStatus.WrittenTest, note: '测试: 2025/10/26' },
  { id: '13', company: '麦当劳', position: '产品经理', applyDate: '2025-09-23T10:00:00.000Z', industry: '食品', companyType: CompanyType.Foreign, status: ApplicationStatus.WrittenTest, note: '测试: 2025/10/25' },
  { id: '14', company: '欧莱雅', position: '电商推广', applyDate: '2025-10-27T10:00:00.000Z', industry: '日化', companyType: CompanyType.Foreign, status: ApplicationStatus.Applied, note: '' },
  { id: '15', company: '迪卡侬', position: '供应商质量管理', applyDate: '2025-10-27T10:00:00.000Z', industry: '快消', companyType: CompanyType.Foreign, status: ApplicationStatus.Applied, note: '' },
  { id: '16', company: '君乐宝', position: '品牌市场产品管培生', applyDate: '2025-10-27T10:00:00.000Z', industry: '快消', companyType: CompanyType.Other, status: ApplicationStatus.WrittenTest, note: '测试: 2025/11/11' },
  { id: '17', company: '名创优品', position: '跨境运营', applyDate: '2025-10-27T10:00:00.000Z', industry: '快消', companyType: CompanyType.Other, status: ApplicationStatus.Rejected, note: '' },
  { id: '18', company: '名创优品', position: '供应链', applyDate: '2025-10-27T10:00:00.000Z', industry: '快消', companyType: CompanyType.Other, status: ApplicationStatus.Rejected, note: '' },
  { id: '19', company: '德邦快递', position: '品牌营销', applyDate: '2025-10-28T10:00:00.000Z', industry: '物流', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '20', company: '小红书', position: '用户研究', applyDate: '2025-10-28T10:00:00.000Z', industry: '互联网', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '' },
  { id: '21', company: '字节跳动', position: '策略产品经理-番茄', applyDate: '2025-10-28T10:00:00.000Z', industry: '互联网', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '' },
  { id: '22', company: 'tcl', position: '市场营销专员', applyDate: '2025-10-28T10:00:00.000Z', industry: '制造业', companyType: CompanyType.Other, status: ApplicationStatus.WrittenTest, note: '测试: 2025/10/31' },
  { id: '23', company: '顺丰', position: '集团管培生', applyDate: '2025-10-28T10:00:00.000Z', industry: '物流', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '24', company: '中石化', position: '贸易经理', applyDate: '2025-10-29T10:00:00.000Z', industry: '能源', companyType: CompanyType.StateOwned, status: ApplicationStatus.Applied, note: '' },
  { id: '25', company: '中石化', position: '市场开发管理', applyDate: '2025-10-29T10:00:00.000Z', industry: '能源', companyType: CompanyType.StateOwned, status: ApplicationStatus.Applied, note: '' },
  { id: '26', company: '百果园', position: '采购', applyDate: '2025-10-29T10:00:00.000Z', industry: '零售', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '27', company: '德物', position: '商品运营', applyDate: '2025-10-29T10:00:00.000Z', industry: '互联网', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '' },
  { id: '28', company: '索尼', position: 'sales marketing', applyDate: '2025-10-30T10:00:00.000Z', industry: '制造业', companyType: CompanyType.Foreign, status: ApplicationStatus.Applied, note: '' },
  { id: '29', company: '苹果', position: '供应链管理上海', applyDate: '2025-11-01T10:00:00.000Z', industry: '手机', companyType: CompanyType.Foreign, status: ApplicationStatus.Applied, note: '' },
  { id: '30', company: '三只松鼠', position: '产品管培生', applyDate: '2025-11-02T10:00:00.000Z', industry: '快消', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '31', company: '老板电器', position: '客户', applyDate: '2025-11-02T10:00:00.000Z', industry: '制造业', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '32', company: '小鹏汽车', position: '销售大区管培生-浙江', applyDate: '2025-09-10T10:00:00.000Z', industry: '汽车', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '33', company: '拼多多', position: '招商管培生', applyDate: '2025-11-04T10:00:00.000Z', industry: '互联网', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '' },
  { id: '34', company: '农夫山泉', position: '行销校招生', applyDate: '2025-11-04T10:00:00.000Z', industry: '快消', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '35', company: '启源芯动力', position: '商业分析', applyDate: '2025-11-14T10:00:00.000Z', industry: '新能源', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '36', company: '乐鑫科技', position: '项目管理', applyDate: '2025-11-14T10:00:00.000Z', industry: '芯片', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '37', company: '南芯', position: '大运营管培生', applyDate: '2025-11-14T10:00:00.000Z', industry: '芯片', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '38', company: '滴滴', position: '产品助理（代驾）', applyDate: '2025-11-14T10:00:00.000Z', industry: '互联网', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '' },
  { id: '39', company: '阿里云', position: '海外用户运营', applyDate: '2025-11-15T10:00:00.000Z', industry: '云服务', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '' },
  { id: '40', company: 'shein', position: '项目管理', applyDate: '2025-11-18T10:00:00.000Z', industry: '海外', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '' },
  { id: '41', company: '安克创新', position: '采购工程师（非生产）', applyDate: '2025-11-18T10:00:00.000Z', industry: '快消', companyType: CompanyType.Other, status: ApplicationStatus.Applied, note: '' },
  { id: '42', company: '盒马', position: '供应链管培生', applyDate: '2025-11-21T10:00:00.000Z', industry: '超市', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '' },
  { id: '43', company: '蚂蚁集团', position: 'AI医疗用户运营', applyDate: '2025-11-21T10:00:00.000Z', industry: '互联网', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '' },
  { id: '44', company: '网易', position: '产品策划专业广告', applyDate: '2025-11-21T10:00:00.000Z', industry: '互联网', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '' },
  { id: '45', company: '哔哩哔哩', position: '商品运营', applyDate: '2025-11-21T10:00:00.000Z', industry: '互联网', companyType: CompanyType.Internet, status: ApplicationStatus.Applied, note: '' }
];
