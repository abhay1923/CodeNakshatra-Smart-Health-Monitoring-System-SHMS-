import type { ConsentItem, Role } from './demo-data';
import { getAccessToken } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface PermissionMap {
  canViewOwnHealth: boolean;
  canManageConsent: boolean;
  canUploadDocuments: boolean;
  canReviewPatients: boolean;
  canRunTriage: boolean;
  canManagePartners: boolean;
  canViewAuditLogs: boolean;
  canManageUsers: boolean;
}

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  name: string;
  permissions: PermissionMap;
}

export interface DashboardPayload {
  user: SessionUser;
  summary: {
    activeAlerts: number;
    unreadNotifications: number;
    connectedPartners: number;
  };
  citizen?: {
    records: Array<{
      id: string;
      name: string;
      age: number;
      condition: string;
      heartRate: number;
      spo2: number;
      esiLevel: number;
      risk: string;
    }>;
    documents: Array<{ id: string; name: string; kind: string; uploadedAt: string }>;
    consents: ConsentItem[];
  };
  doctor?: {
    patients: Array<{
      id: string;
      name: string;
      age: number;
      condition: string;
      heartRate: number;
      spo2: number;
      esiLevel: number;
      risk: string;
    }>;
    urgentQueue: Array<{
      id: string;
      name: string;
      age: number;
      condition: string;
      heartRate: number;
      spo2: number;
      esiLevel: number;
      risk: string;
    }>;
    handoffNotes: string[];
  };
  admin?: {
    feeds: Array<{ id: string; partner: string; format: string; latency: string; status: string }>;
    audit: Array<{ id: string; actor: string; action: string; surface: string; timestamp: string }>;
    pendingApprovals: number;
    incidents: number;
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchApiHealth() {
  return apiFetch<{ status: string; version: string; auth: string }>('/health');
}

export function fetchSessionProfile() {
  return apiFetch<{ user: SessionUser; supabaseUrl: string }>('/api/v1/auth/session');
}

export function fetchDashboard() {
  return apiFetch<DashboardPayload>('/api/v1/dashboard');
}

export function updateConsent(id: string, enabled: boolean) {
  return apiFetch<{ consent: ConsentItem }>('/api/v1/citizen/consents/' + id, {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  });
}

export function runDoctorTriage(input: {
  heartRate: number;
  spo2: number;
  symptoms: string;
}) {
  return apiFetch<{ esiLevel: number; risk: string; reviewedBy: string }>('/api/v1/doctor/triage', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
