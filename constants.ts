
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
export const MOCK_INITIAL_DATA: any[] = [];
