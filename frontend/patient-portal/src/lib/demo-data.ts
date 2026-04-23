export type Role = 'citizen' | 'doctor' | 'admin';

export interface ConsentItem {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  role: Role;
}

export interface UploadEntry {
  id: string;
  name: string;
  kind: string;
  uploadedAt: string;
}

export interface HealthTip {
  id: string;
  title: string;
  body: string;
}

export interface AppState {
  preferredLanguage: string;
  voiceEnabled: boolean;
  uploadedFiles: UploadEntry[];
  consents: ConsentItem[];
  reviews: Review[];
  notes: string;
}

export const defaultConsents: ConsentItem[] = [
  {
    id: 'consent-labs',
    label: 'Share labs with care team',
    description: 'Allow doctors to review test results and encounter notes.',
    enabled: true,
  },
  {
    id: 'consent-alerts',
    label: 'Critical alert outreach',
    description: 'Send SMS, push, and voice escalation if triage becomes severe.',
    enabled: true,
  },
];

export const defaultReviews: Review[] = [
  {
    id: 'review-1',
    author: 'Maya Joseph',
    rating: 5,
    comment: 'The live triage updates made my follow-up incredibly fast and clear.',
    role: 'citizen',
  },
  {
    id: 'review-2',
    author: 'Dr. Li',
    rating: 4,
    comment: 'The doctor workflow keeps the urgent queue visible and actionable.',
    role: 'doctor',
  },
];

export const healthTips: HealthTip[] = [
  {
    id: 'tip-1',
    title: 'Hydration checkpoint',
    body: 'Recovery trend improves when fluid goals are split into smaller reminders through the day.',
  },
  {
    id: 'tip-2',
    title: 'Risk-aware movement',
    body: 'Short walking intervals after stable vitals can improve oxygen recovery without raising strain.',
  },
  {
    id: 'tip-3',
    title: 'Medication adherence',
    body: 'Missed evening medication patterns are showing up in your alert timeline. Use push reminders tonight.',
  },
];

export const defaultState: AppState = {
  preferredLanguage: 'English',
  voiceEnabled: false,
  uploadedFiles: [
    { id: 'file-1', name: 'blood-work-april.csv', kind: 'CSV', uploadedAt: 'Today, 09:06' },
    { id: 'file-2', name: 'discharge-summary.pdf', kind: 'PDF', uploadedAt: 'Yesterday, 18:24' },
  ],
  consents: defaultConsents,
  reviews: defaultReviews,
  notes: 'Citizen reports lower fatigue after medication timing adjustment.',
};
