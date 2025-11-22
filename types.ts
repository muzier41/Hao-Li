export enum ApplicationStatus {
  Applied = 'Applied',
  WrittenTest = 'Written Test',
  AIInterview = 'AI Interview',
  FirstRound = '1st Round',
  SecondRound = '2nd Round',
  HRRound = 'HR Round',
  Offer = 'Offer',
  Rejected = 'Rejected',
}

export enum CompanyType {
  StateOwned = 'State Owned',
  Foreign = 'Foreign',
  Internet = 'Internet',
  Consulting = 'Consulting',
  Startup = 'Startup',
  Other = 'Other',
}

export enum EventType {
  Interview = 'Interview', // Point (Time spot)
  TestOrAI = 'TestOrAI',   // Range (Time segment)
  Other = 'Other',
}

export interface JobEvent {
  id: string;
  applicationId: string;
  title: string;
  type: EventType;
  start: string; // ISO Date string
  end?: string; // ISO Date string, optional for point events
  isCompleted?: boolean; // New field for checkbox status
}

export interface Application {
  id: string;
  company: string;
  position: string;
  applyDate: string; // ISO Date string
  industry: string;
  companyType: CompanyType;
  status: ApplicationStatus;
  note: string;
}

export interface DashboardStats {
  total: number;
  byIndustry: { name: string; value: number }[];
  byType: { name: string; value: number }[];
  funnel: { name: string; value: number }[];
  trend: { name: string; value: number }[];
}