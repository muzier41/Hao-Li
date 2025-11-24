
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
  [CompanyType.Internet]: '#007AFF', // Blue
  [CompanyType.StateOwned]: '#FF3B30', // Red
  [CompanyType.Foreign]: '#AF52DE', // Purple
  [CompanyType.Private]: '#34C759', // Green (General Private)
  [CompanyType.Financial]: '#FF9500', // Orange (Finance)
  [CompanyType.Manufacturing]: '#5856D6', // Indigo (Manufacturing)
  [CompanyType.Education]: '#FF2D55', // Pink (Education)
  [CompanyType.Consulting]: '#A2845E', // Brown (Consulting)
  [CompanyType.Startup]: '#30B0C7', // Teal (Startup)
  [CompanyType.Other]: '#8E8E93', // Gray
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
  [CompanyType.StateOwned]: '国企/央企',
  [CompanyType.Foreign]: '外企',
  [CompanyType.Internet]: '互联网',
  [CompanyType.Private]: '民营企业',
  [CompanyType.Financial]: '金融/银行',
  [CompanyType.Manufacturing]: '制造/实业',
  [CompanyType.Education]: '教育/科研',
  [CompanyType.Consulting]: '咨询/服务',
  [CompanyType.Startup]: '初创公司',
  [CompanyType.Other]: '其他',
};

export const EVENT_TYPE_LABELS_CN: Record<EventType, string> = {
  [EventType.Interview]: '面试',
  [EventType.TestOrAI]: '测试/AI面试',
  [EventType.Other]: '其他',
};

// Data from User Excel Import
export const MOCK_INITIAL_DATA: any[] = [];
