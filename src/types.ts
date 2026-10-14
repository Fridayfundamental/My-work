export type TabType = 
  | 'dashboard' 
  | 'giza' 
  | 'survey' 
  | 'map' 
  | 'officers' 
  | 'reports';

export interface Survey {
  id: string;
  officerName: string;
  province: string;
  ward: string;
  surveyType: string;
  householdsVisited: number;
  waterAccess: number; // percentage
  observations: string;
  status: 'Active' | 'Pending' | 'Upcoming';
  date: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface FieldOfficer {
  id: string;
  name: string;
  initials: string;
  province: string;
  surveyType: string;
  surveyCount: number;
  status: 'Active' | 'Pending' | 'Upcoming';
}

export interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  size: string;
  author: string;
}

export interface ProvinceData {
  name: string;
  waterAccess: number;
  surveysCount: number;
}
