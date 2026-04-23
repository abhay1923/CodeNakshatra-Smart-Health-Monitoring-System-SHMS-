import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

type Role = 'citizen' | 'doctor' | 'admin';

interface PermissionMap {
  canViewOwnHealth: boolean;
  canManageConsent: boolean;
  canUploadDocuments: boolean;
  canReviewPatients: boolean;
  canRunTriage: boolean;
  canManagePartners: boolean;
  canViewAuditLogs: boolean;
  canManageUsers: boolean;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  name: string;
  permissions: PermissionMap;
  claims: JWTPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const app = express();
const PORT = Number(process.env.PORT || 3001);
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ssleaezheghgxrnoqjkp.supabase.co';
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const jwks = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

const permissionsByRole: Record<Role, PermissionMap> = {
  citizen: {
    canViewOwnHealth: true,
    canManageConsent: true,
    canUploadDocuments: true,
    canReviewPatients: false,
    canRunTriage: false,
    canManagePartners: false,
    canViewAuditLogs: false,
    canManageUsers: false,
  },
  doctor: {
    canViewOwnHealth: true,
    canManageConsent: false,
    canUploadDocuments: true,
    canReviewPatients: true,
    canRunTriage: true,
    canManagePartners: false,
    canViewAuditLogs: false,
    canManageUsers: false,
  },
  admin: {
    canViewOwnHealth: true,
    canManageConsent: true,
    canUploadDocuments: true,
    canReviewPatients: true,
    canRunTriage: true,
    canManagePartners: true,
    canViewAuditLogs: true,
    canManageUsers: true,
  },
};

const patients = [
  {
    id: 'pt-2048',
    name: 'Maya Joseph',
    age: 57,
    condition: 'Cardiac telemetry and medication adjustment',
    heartRate: 108,
    spo2: 93,
    esiLevel: 2,
    risk: 'High',
    ownerId: 'demo-citizen',
  },
  {
    id: 'pt-3017',
    name: 'Rohan Singh',
    age: 44,
    condition: 'Diabetes management and lab follow-up',
    heartRate: 92,
    spo2: 95,
    esiLevel: 3,
    risk: 'Moderate',
    ownerId: 'demo-citizen',
  },
];

const citizenAssets = {
  documents: [
    { id: 'doc-1', name: 'blood-work-april.csv', kind: 'CSV', uploadedAt: 'Today, 09:06' },
    { id: 'doc-2', name: 'discharge-summary.pdf', kind: 'PDF', uploadedAt: 'Yesterday, 18:24' },
  ],
  consents: [
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
  ],
};

const partnerFeeds = [
  { id: 'partner-1', partner: 'Northwind Labs', format: 'FHIR', latency: '1.1s', status: 'Healthy' },
  { id: 'partner-2', partner: 'PulseBand Wearables', format: 'Webhook', latency: '2.8s', status: 'Warning' },
  { id: 'partner-3', partner: 'Civic Health Screening', format: 'CSV', latency: '5.2s', status: 'Action needed' },
];

const auditEvents = [
  { id: 'audit-1', actor: 'system', action: 'ESI triage recalculated from live vitals', surface: 'AI engine', timestamp: '09:12' },
  { id: 'audit-2', actor: 'admin@shms', action: 'Repaired dead-letter partner payload', surface: 'Admin console', timestamp: '09:18' },
  { id: 'audit-3', actor: 'citizen portal', action: 'Consent updated for notifications', surface: 'Citizen app', timestamp: '09:21' },
];

app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  }),
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

function resolveRole(payload: JWTPayload): Role {
  const fromMetadata =
    readNestedRole(payload, 'user_metadata') ||
    readNestedRole(payload, 'app_metadata') ||
    readNestedRole(payload, 'metadata');

  if (fromMetadata === 'doctor' || fromMetadata === 'admin' || fromMetadata === 'citizen') {
    return fromMetadata;
  }

  return 'citizen';
}

function readNestedRole(payload: JWTPayload, field: string): string | undefined {
  const source = payload[field];
  if (typeof source === 'object' && source && 'role' in source) {
    const role = (source as { role?: unknown }).role;
    return typeof role === 'string' ? role : undefined;
  }
  return undefined;
}

async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    });

    const role = resolveRole(payload);
    req.user = {
      id: typeof payload.sub === 'string' ? payload.sub : 'unknown-user',
      email: typeof payload.email === 'string' ? payload.email : 'unknown@user',
      name:
        (typeof payload.user_metadata === 'object' &&
        payload.user_metadata &&
        'full_name' in payload.user_metadata &&
        typeof payload.user_metadata.full_name === 'string'
          ? payload.user_metadata.full_name
          : undefined) || 'SHMS User',
      role,
      permissions: permissionsByRole[role],
      claims: payload,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      details: error instanceof Error ? error.message : 'Unknown auth error',
    });
  }
}

function authorize(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        role: req.user.role,
        allowedRoles,
      });
    }

    return next();
  };
}

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    auth: 'supabase-jwt-rbac',
  });
});

app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    message: 'Smart Health Monitoring System Backend API v1',
    endpoints: [
      '/health',
      '/api/v1/auth/session',
      '/api/v1/dashboard',
      '/api/v1/citizen/records',
      '/api/v1/doctor/patients',
      '/api/v1/admin/audit',
    ],
  });
});

app.get('/api/v1/auth/session', authenticate, (req: Request, res: Response) => {
  res.json({
    user: req.user,
    supabaseUrl: SUPABASE_URL,
  });
});

app.get('/api/v1/dashboard', authenticate, (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const base = {
    user: req.user,
    summary: {
      activeAlerts: 3,
      unreadNotifications: req.user.role === 'citizen' ? 4 : req.user.role === 'doctor' ? 8 : 11,
      connectedPartners: partnerFeeds.filter((feed) => feed.status === 'Healthy').length,
    },
  };

  if (req.user.role === 'citizen') {
    return res.json({
      ...base,
      citizen: {
        records: patients.filter((patient) => patient.ownerId === 'demo-citizen'),
        documents: citizenAssets.documents,
        consents: citizenAssets.consents,
      },
    });
  }

  if (req.user.role === 'doctor') {
    return res.json({
      ...base,
      doctor: {
        patients,
        urgentQueue: patients.filter((patient) => patient.esiLevel <= 2),
        handoffNotes: [
          'Maya Joseph needs medication review before discharge.',
          'Rohan Singh follow-up lab window opens at 18:00.',
        ],
      },
    });
  }

  return res.json({
    ...base,
    admin: {
      feeds: partnerFeeds,
      audit: auditEvents,
      pendingApprovals: 5,
      incidents: 2,
    },
  });
});

app.get('/api/v1/citizen/records', authenticate, authorize(['citizen', 'admin']), (req: Request, res: Response) => {
  res.json({
    records: patients.filter((patient) => patient.ownerId === 'demo-citizen'),
    documents: citizenAssets.documents,
    consents: citizenAssets.consents,
  });
});

app.post('/api/v1/citizen/consents/:id', authenticate, authorize(['citizen', 'admin']), (req: Request, res: Response) => {
  const consent = citizenAssets.consents.find((item) => item.id === req.params.id);

  if (!consent) {
    return res.status(404).json({ error: 'Consent not found' });
  }

  consent.enabled = typeof req.body.enabled === 'boolean' ? req.body.enabled : !consent.enabled;
  return res.json({ consent, updatedBy: req.user?.email });
});

app.get('/api/v1/doctor/patients', authenticate, authorize(['doctor', 'admin']), (_req: Request, res: Response) => {
  res.json({
    patients,
    criticalCount: patients.filter((patient) => patient.esiLevel <= 2).length,
  });
});

app.post('/api/v1/doctor/triage', authenticate, authorize(['doctor', 'admin']), (req: Request, res: Response) => {
  const { heartRate, spo2, symptoms } = req.body as { heartRate?: number; spo2?: number; symptoms?: string };

  const esiLevel =
    typeof spo2 === 'number' && spo2 < 92
      ? 2
      : typeof heartRate === 'number' && heartRate > 110
        ? 3
        : typeof symptoms === 'string' && symptoms.toLowerCase().includes('chest')
          ? 2
          : 4;

  return res.json({
    esiLevel,
    risk: esiLevel <= 2 ? 'High' : esiLevel === 3 ? 'Moderate' : 'Low',
    reviewedBy: req.user?.email,
  });
});

app.get('/api/v1/admin/feeds', authenticate, authorize(['admin']), (_req: Request, res: Response) => {
  res.json({ feeds: partnerFeeds });
});

app.get('/api/v1/admin/audit', authenticate, authorize(['admin']), (_req: Request, res: Response) => {
  res.json({ audit: auditEvents });
});

app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SHMS Backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
