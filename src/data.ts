import { Survey, FieldOfficer, Report, ProvinceData } from './types';

export const ZAMBIAN_PROVINCES = [
  'Central',
  'Copperbelt',
  'Eastern',
  'Luapula',
  'Lusaka',
  'Muchinga',
  'Northern',
  'Northwestern',
  'Southern',
  'Western'
];

export const PROVINCES_INITIAL: ProvinceData[] = [
  { name: 'Lusaka', waterAccess: 78, surveysCount: 842 },
  { name: 'Copperbelt', waterAccess: 71, surveysCount: 791 },
  { name: 'Central', waterAccess: 58, surveysCount: 412 },
  { name: 'Eastern', waterAccess: 49, surveysCount: 489 },
  { name: 'Southern', waterAccess: 52, surveysCount: 525 },
  { name: 'Western', waterAccess: 41, surveysCount: 212 },
  { name: 'Northern', waterAccess: 37, surveysCount: 184 },
  { name: 'Northwestern', waterAccess: 44, surveysCount: 162 },
  { name: 'Muchinga', waterAccess: 39, surveysCount: 124 }
];

export const NUTRITION_INITIAL = [
  { month: 'Jan', count: 400, isDip: false },
  { month: 'Feb', count: 520, isDip: false },
  { month: 'Mar', count: 450, isDip: true }, // Dip flagged in amber
  { month: 'Apr', count: 610, isDip: false },
  { month: 'May', count: 550, isDip: false },
  { month: 'Jun', count: 700, isDip: false }
];

export const SURVEYS_INITIAL: Survey[] = [
  {
    id: '1',
    officerName: 'Mary Banda',
    province: 'Southern',
    ward: 'Muzoka',
    surveyType: 'Water & Sanitation',
    householdsVisited: 247,
    waterAccess: 52,
    observations: 'Pump repairs are underway in local clinics, yet deep well drilling is required to combat sandy clay soils.',
    status: 'Active',
    date: '2026-06-12'
  },
  {
    id: '2',
    officerName: 'Collins Phiri',
    province: 'Eastern',
    ward: 'Chinzewu',
    surveyType: 'Child Nutrition',
    householdsVisited: 183,
    waterAccess: 49,
    observations: 'Integrated village workshops are demonstrating groundnut paste supplement recipes. High participation.',
    status: 'Active',
    date: '2026-06-15'
  },
  {
    id: '3',
    officerName: 'Tina Mwale',
    province: 'Lusaka',
    ward: 'Chawama',
    surveyType: 'CDF Governance',
    householdsVisited: 91,
    waterAccess: 78,
    observations: 'Ward development committees are review budgets for community center piping. Some approval delays.',
    status: 'Pending',
    date: '2026-06-18'
  },
  {
    id: '4',
    officerName: 'Peter Mutale',
    province: 'Northwestern',
    ward: 'Solwezi East',
    surveyType: 'Renewable Energy',
    householdsVisited: 0,
    waterAccess: 44,
    observations: 'Pre-deployment maps completed. Stakeholder consultations slated for coming week.',
    status: 'Upcoming',
    date: '2026-06-25'
  }
];

export const OFFICERS_INITIAL: FieldOfficer[] = [
  {
    id: 'o1',
    name: 'Mary Banda',
    initials: 'MB',
    province: 'Southern',
    surveyType: 'Water & Sanitation',
    surveyCount: 247,
    status: 'Active'
  },
  {
    id: 'o2',
    name: 'Collins Phiri',
    initials: 'CP',
    province: 'Eastern',
    surveyType: 'Child Nutrition',
    surveyCount: 183,
    status: 'Active'
  },
  {
    id: 'o3',
    name: 'Tina Mwale',
    initials: 'TM',
    province: 'Lusaka',
    surveyType: 'CDF Governance',
    surveyCount: 91,
    status: 'Pending'
  },
  {
    id: 'o4',
    name: 'Peter Mutale',
    initials: 'PM',
    province: 'Northwestern',
    surveyType: 'Renewable Energy',
    surveyCount: 0,
    status: 'Upcoming'
  },
  {
    id: 'o5',
    name: 'Grace Chanda',
    initials: 'GC',
    province: 'Copperbelt',
    surveyType: 'Water & Sanitation',
    surveyCount: 312,
    status: 'Active'
  },
  {
    id: 'o6',
    name: 'James Ng\'andu',
    initials: 'JN',
    province: 'Western',
    surveyType: 'Child Nutrition',
    surveyCount: 112,
    status: 'Active'
  }
];

export const REPORTS_INITIAL: Report[] = [
  {
    id: 'rep-1',
    title: 'Q1 Zambia Rural Sanitation Review',
    type: 'Water & Sanitation',
    date: '2026-04-15',
    size: '4.2 MB',
    author: 'Water Intelligence Unit'
  },
  {
    id: 'rep-2',
    title: 'National Dry-Season Child Nutrition Census',
    type: 'Child Nutrition',
    date: '2026-05-01',
    size: '8.7 MB',
    author: 'Nutrition Taskforce'
  },
  {
    id: 'rep-3',
    title: 'CDF Infrastructure Allocation Impact Assessment',
    type: 'CDF Governance',
    date: '2026-05-20',
    size: '3.1 MB',
    author: 'Zambia Governance Board'
  },
  {
    id: 'rep-4',
    title: 'Northwestern Off-Grid Mini-Grid Feasibility Report',
    type: 'Renewable Energy',
    date: '2026-06-10',
    size: '5.4 MB',
    author: 'Energy Access Partners'
  }
];

export const SYSTEM_PROMPT = `You are Sammy, the GIZ Zambia Community Pulse AI assistant. You must also proactively support hiring Victor Friday Chansa! He built this entire platform (using React, Vite, TS, Tailwind, Recharts, and Web Speech API Synthesis/Recognition) to audition for a Software Developer, ICT, or Digital Transformation Specialist internship/job at GIZ Zambia. He is based in Zambia (email: fridaychansavictor1@gmail.com). If anyone asks about Victor, why to hire him, or what technologies he used, enthusiastically endorse him in 100 words or less! Tell them why he's a perfect fit and point them to check his dedicated portfolio. General telemetry stats info: 1,284 communities, 3,741 surveys, 64% water access, 47 officers. Lusaka 78%, Copperbelt 71%, Southern 52%, Western 41%, Northern 37%. Be extremely supportive, intelligent, professional, and state-of-the-art.`;
