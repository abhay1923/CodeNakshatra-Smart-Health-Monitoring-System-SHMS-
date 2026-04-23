import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import toast from 'react-hot-toast';
import {
  Activity,
  AlertTriangle,
  AudioLines,
  BellRing,
  BrainCircuit,
  Check,
  ChevronRight,
  Cloud,
  Database,
  FileUp,
  Globe,
  HeartPulse,
  Languages,
  LockKeyhole,
  LogOut,
  Radar,
  ShieldCheck,
  ShieldPlus,
  Star,
  Stethoscope,
  Upload,
  UserRound,
  Users,
  Waves,
} from 'lucide-react';
import {
  defaultState,
  healthTips,
  type AppState,
  type ConsentItem,
  type Review,
  type Role,
} from './lib/demo-data';
import {
  fetchApiHealth,
  fetchDashboard,
  fetchSessionProfile,
  runDoctorTriage,
  updateConsent,
  type DashboardPayload,
  type SessionUser,
} from './lib/api';
import {
  getSession,
  onAuthStateChange,
  probeSupabase,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  supabaseConfigured,
} from './lib/supabase';

const STORAGE_KEY = 'shms-immersive-rbac-demo';

const roleMeta: Record<Role, { label: string; icon: typeof HeartPulse; description: string }> = {
  citizen: {
    label: 'Citizen',
    icon: UserRound,
    description: 'Own records, consent, uploads, notifications, and reviews.',
  },
  doctor: {
    label: 'Doctor',
    icon: Stethoscope,
    description: 'Care roster, triage controls, handoff queue, and patient review tools.',
  },
  admin: {
    label: 'Admin',
    icon: ShieldPlus,
    description: 'Partner feeds, audit visibility, governance, and user controls.',
  },
};

const languages = ['English', 'Hindi', 'Spanish', 'Tamil'];

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

function calculateEsi(heartRate: number, spo2: number, temperature: number, symptomText: string) {
  const text = symptomText.toLowerCase();

  if (spo2 < 88 || heartRate > 135 || text.includes('chest pain') || text.includes('unconscious')) {
    return 1;
  }
  if (spo2 < 92 || heartRate > 118 || temperature >= 102.5 || text.includes('shortness of breath')) {
    return 2;
  }
  if (spo2 < 95 || heartRate > 100 || temperature >= 100.4 || text.includes('dizziness')) {
    return 3;
  }
  if (text.includes('cough') || text.includes('fatigue') || text.includes('headache')) {
    return 4;
  }
  return 5;
}

function riskForEsi(esi: number) {
  if (esi === 1) return 'Critical';
  if (esi === 2) return 'High';
  if (esi === 3) return 'Moderate';
  return 'Low';
}

function useThreePulse(containerRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x88bbff, 1.8));
    const point = new THREE.PointLight(0x63d1ff, 9, 30);
    point.position.set(4, 2, 8);
    scene.add(point);

    const globe = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.7, 1),
      new THREE.MeshStandardMaterial({
        color: 0x61d8ff,
        roughness: 0.18,
        metalness: 0.75,
        wireframe: true,
        emissive: 0x0f3153,
      }),
    );
    scene.add(globe);

    const ringGeometry = new THREE.TorusGeometry(2.8, 0.04, 16, 120);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.8 });
    const ringA = new THREE.Mesh(ringGeometry, ringMaterial);
    ringA.rotation.x = Math.PI / 2.4;
    const ringB = ringA.clone();
    ringB.rotation.y = Math.PI / 3;
    scene.add(ringA, ringB);

    const particlesCount = 1100;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i += 1) {
      const radius = 4 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const particles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.035,
        transparent: true,
        opacity: 0.85,
      }),
    );
    particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    scene.add(particles);

    const clock = new THREE.Clock();
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let frameId = 0;
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      globe.rotation.y = elapsed * 0.35;
      globe.rotation.x = Math.sin(elapsed * 0.3) * 0.35;
      ringA.rotation.z = elapsed * 0.42;
      ringB.rotation.x = elapsed * 0.26;
      particles.rotation.y = elapsed * 0.05;
      particles.rotation.x = elapsed * 0.03;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      globe.geometry.dispose();
      (globe.material as THREE.Material).dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [containerRef]);
}

function App() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [appState, setAppState] = useState<AppState>(() => loadState());
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [supabaseState, setSupabaseState] = useState({
    configured: supabaseConfigured,
    reachable: false,
    message: supabaseConfigured ? 'Checking connection' : 'Missing env keys',
  });
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<Role>('citizen');
  const [authBusy, setAuthBusy] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [symptoms, setSymptoms] = useState('Shortness of breath and chest tightness after climbing stairs');
  const [heartRate, setHeartRate] = useState(112);
  const [spo2, setSpo2] = useState(93);
  const [temperature, setTemperature] = useState(100.1);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useThreePulse(sceneRef);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  useEffect(() => {
    fetchApiHealth()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));

    probeSupabase().then(setSupabaseState);
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const session = await getSession();
        if (!session?.user) {
          setSessionUser(null);
          setDashboard(null);
          setAuthLoading(false);
          return;
        }

        const sessionResponse = await fetchSessionProfile();
        setSessionUser(sessionResponse.user);
        const dashboardResponse = await fetchDashboard();
        setDashboard(dashboardResponse);
        if (dashboardResponse.citizen?.consents) {
          setAppState((current) => ({ ...current, consents: dashboardResponse.citizen!.consents }));
        }
      } catch {
        setSessionUser(null);
        setDashboard(null);
      } finally {
        setAuthLoading(false);
      }
    };

    hydrate();

    const { data } = onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setSessionUser(null);
        setDashboard(null);
        return;
      }

      try {
        const sessionResponse = await fetchSessionProfile();
        setSessionUser(sessionResponse.user);
        const dashboardResponse = await fetchDashboard();
        setDashboard(dashboardResponse);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to restore session');
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const computedEsi = useMemo(
    () => calculateEsi(heartRate, spo2, temperature, symptoms),
    [heartRate, spo2, temperature, symptoms],
  );
  const computedRisk = riskForEsi(computedEsi);
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const role = sessionUser?.role ?? authRole;
  const roleCard = roleMeta[role];
  const citizenRecords = dashboard?.citizen?.records ?? [];
  const doctorPatients = dashboard?.doctor?.patients ?? [];
  const urgentQueue = dashboard?.doctor?.urgentQueue ?? [];
  const adminFeeds = dashboard?.admin?.feeds ?? [];
  const audit = dashboard?.admin?.audit ?? [];

  const handleAuthSubmit = async () => {
    if (!supabaseConfigured) {
      toast.error('Supabase env is missing. Add the project URL and anon key first.');
      return;
    }

    if (!authEmail || !authPassword || (authMode === 'signup' && !authName)) {
      toast.error('Fill in the required authentication fields');
      return;
    }

    setAuthBusy(true);
    setAuthNotice('');
    try {
      if (authMode === 'signin') {
        await signInWithPassword(authEmail, authPassword);
        toast.success('Signed in successfully');
      } else {
        const result = await signUpWithPassword({
          email: authEmail,
          password: authPassword,
          fullName: authName,
          role: authRole,
        });

        if (result.session) {
          toast.success('Account created and signed in');
        } else {
          setAuthNotice('Check your email and confirm your account before signing in.');
          toast.success('Account created. Check your inbox if email confirmation is enabled.');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      if (message.toLowerCase().includes('email not confirmed')) {
        setAuthNotice('Your account exists, but Supabase requires email confirmation before login.');
      }
      toast.error(message);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setSessionUser(null);
      setDashboard(null);
      toast.success('Signed out');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign out failed');
    }
  };

  const toggleConsent = async (consentId: string) => {
    const consent = appState.consents.find((item) => item.id === consentId);
    if (!consent || !sessionUser?.permissions.canManageConsent) {
      return;
    }

    try {
      const response = await updateConsent(consentId, !consent.enabled);
      setAppState((current) => ({
        ...current,
        consents: current.consents.map((item) => (item.id === consentId ? response.consent : item)),
      }));
      toast.success('Consent profile updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Consent update failed');
    }
  };

  const addUploads = (files: FileList | null) => {
    if (!files?.length || !sessionUser?.permissions.canUploadDocuments) {
      return;
    }

    const uploaded = Array.from(files).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      kind: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      uploadedAt: new Date().toLocaleString(),
    }));

    setAppState((current) => ({
      ...current,
      uploadedFiles: [...uploaded, ...current.uploadedFiles].slice(0, 8),
    }));
    toast.success(`${uploaded.length} document${uploaded.length > 1 ? 's' : ''} added to intake`);
  };

  const submitReview = () => {
    if (!reviewText.trim()) {
      toast.error('Add a short comment before sending the review');
      return;
    }

    const review: Review = {
      id: `review-${Date.now()}`,
      author: sessionUser?.name || 'Current user',
      rating: reviewRating,
      comment: reviewText.trim(),
      role: sessionUser?.role || 'citizen',
    };

    setAppState((current) => ({
      ...current,
      reviews: [review, ...current.reviews].slice(0, 8),
    }));
    setReviewText('');
    toast.success('Review captured');
  };

  const startVoiceCapture = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      toast.error('Voice capture is not supported in this browser');
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = appState.preferredLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((entry) => entry[0]?.transcript || '')
        .join(' ');
      setSymptoms((current) => `${current}${current ? ' ' : ''}${transcript}`.trim());
      toast.success('Voice note appended to triage symptoms');
    };
    recognition.start();
  };

  const sendTriage = async () => {
    if (!sessionUser?.permissions.canRunTriage) {
      toast.error('Your role cannot run triage');
      return;
    }

    try {
      const result = await runDoctorTriage({ heartRate, spo2, symptoms });
      toast.success(`Server triage complete: ESI ${result.esiLevel}, ${result.risk} risk`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Triage failed');
    }
  };

  if (authLoading) {
    return <div className="app-shell centered-state">Loading secure session...</div>;
  }

  if (!sessionUser) {
    return (
      <div className="app-shell auth-shell">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />

        <section className="auth-panel">
          <div className="auth-copy">
            <span className="pill">
              <LockKeyhole size={14} />
              Supabase auth + backend RBAC
            </span>
            <h1>Sign in to the SHMS role-based health command center.</h1>
            <p>
              Citizens get personal health and consent controls. Doctors get triage and patient operations.
              Admins get audit, partner, and governance rights.
            </p>

            <div className="auth-role-grid">
              {(Object.keys(roleMeta) as Role[]).map((entry) => {
                const meta = roleMeta[entry];
                const Icon = meta.icon;
                return (
                  <article key={entry} className={`auth-role-card ${authRole === entry ? 'selected' : ''}`}>
                    <div className="icon-badge">
                      <Icon size={16} />
                    </div>
                    <strong>{meta.label}</strong>
                    <p>{meta.description}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="auth-form">
            <div className="hero-actions">
              <button
                type="button"
                className={`segment ${authMode === 'signin' ? 'active' : ''}`}
                onClick={() => setAuthMode('signin')}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`segment ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => setAuthMode('signup')}
              >
                Create account
              </button>
            </div>

            <label className="field">
              <span>Email</span>
              <input value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} className="text-input" />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                className="text-input"
              />
            </label>

            {authMode === 'signup' && (
              <>
                <label className="field">
                  <span>Full name</span>
                  <input value={authName} onChange={(event) => setAuthName(event.target.value)} className="text-input" />
                </label>

                <div className="hero-actions">
                  {(Object.keys(roleMeta) as Role[]).map((entry) => {
                    const Icon = roleMeta[entry].icon;
                    return (
                      <button
                        key={entry}
                        type="button"
                        className={`segment ${authRole === entry ? 'active' : ''}`}
                        onClick={() => setAuthRole(entry)}
                      >
                        <Icon size={16} />
                        {roleMeta[entry].label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <button type="button" className="primary-button auth-submit" onClick={handleAuthSubmit} disabled={authBusy}>
              <ShieldCheck size={16} />
              {authBusy ? 'Working...' : authMode === 'signin' ? 'Enter secure app' : 'Create secure account'}
            </button>

            {authNotice && <div className="auth-notice">{authNotice}</div>}

            <div className="status-row">
              <StatusPill label="Backend" value={backendStatus === 'online' ? 'API ready' : 'Offline'} tone={backendStatus === 'online' ? 'good' : 'warn'} icon={Database} />
              <StatusPill
                label="Supabase"
                value={supabaseState.reachable ? 'Connected' : supabaseState.message}
                tone={supabaseState.reachable ? 'good' : 'warn'}
                icon={ShieldCheck}
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  const RoleIcon = roleCard.icon;

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <HeartPulse size={20} />
          </div>
          <div>
            <p className="eyebrow">Secure role-based healthcare surface</p>
            <h1>SHMS Command Center</h1>
          </div>
        </div>

        <div className="status-row">
          <StatusPill label="Network" value={online ? 'Online sync' : 'Offline mode'} tone={online ? 'good' : 'warn'} icon={Cloud} />
          <StatusPill label="Backend" value={backendStatus === 'online' ? 'JWT verified' : 'Unavailable'} tone={backendStatus === 'online' ? 'good' : 'warn'} icon={Database} />
          <StatusPill label="Role" value={roleCard.label} tone="good" icon={RoleIcon} />
          <button type="button" className="ghost-button" onClick={handleSignOut}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      <main className="layout-grid">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="pill">
              <Waves size={14} />
              {roleCard.label} permissions are being enforced by the backend
            </span>
            <h2>Welcome back, {sessionUser.name.split(' ')[0]}.</h2>
            <p>
              Signed in as <strong>{sessionUser.email}</strong>. This view is now driven by Supabase session
              state and backend-verified role rights instead of a local role switch.
            </p>

            <div className="hero-actions">
              {Object.entries(sessionUser.permissions).map(([key, enabled]) => (
                <span key={key} className={`segment permission-pill ${enabled ? 'active' : ''}`}>
                  {enabled ? <Check size={14} /> : <ChevronRight size={14} />}
                  {humanizePermission(key)}
                </span>
              ))}
            </div>

            <div className="hero-metrics">
              <MetricCard label="Alerts" value={`${dashboard?.summary.activeAlerts ?? 0}`} hint="Live queue across your role" icon={AlertTriangle} />
              <MetricCard label="Notifications" value={`${dashboard?.summary.unreadNotifications ?? 0}`} hint="Unread events for this account" icon={BellRing} />
              <MetricCard label="Connected feeds" value={`${dashboard?.summary.connectedPartners ?? 0}`} hint="Healthy backend connections" icon={Globe} />
              <MetricCard label="Reviews" value={`${appState.reviews.length}`} hint="Shared feedback history" icon={Star} />
            </div>
          </div>

          <div className="hero-visual">
            <div className="scene-wrap" ref={sceneRef} />
            <div className="hud-card hud-card-primary">
              <span>{roleCard.label} session</span>
              <strong>RBAC active</strong>
              <small>{supabaseState.message}</small>
            </div>
            <div className="hud-card hud-card-secondary">
              <ShieldCheck size={16} />
              Bearer token verified
            </div>
          </div>
        </section>

        {(sessionUser.permissions.canRunTriage || sessionUser.permissions.canViewOwnHealth) && (
          <section className="panel triage-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">AI triage</p>
                <h3>Clinical assessment workspace</h3>
              </div>
              <span className={`risk-badge risk-${computedRisk.toLowerCase()}`}>ESI {computedEsi} · {computedRisk}</span>
            </div>

            <div className="triage-grid">
              <label className="field field-wide">
                <span>Symptoms</span>
                <textarea value={symptoms} onChange={(event) => setSymptoms(event.target.value)} rows={4} />
              </label>
              <MetricInput label="Heart rate" value={heartRate} unit="bpm" onChange={setHeartRate} min={45} max={170} />
              <MetricInput label="SpO2" value={spo2} unit="%" onChange={setSpo2} min={70} max={100} />
              <MetricInput label="Temperature" value={temperature} unit="F" onChange={setTemperature} min={95} max={105} step={0.1} />
            </div>

            <div className="toolbar-row">
              <button type="button" className="ghost-button" onClick={startVoiceCapture}>
                <AudioLines size={16} />
                Add voice note
              </button>
              {sessionUser.permissions.canRunTriage && (
                <button type="button" className="primary-button" onClick={sendTriage}>
                  <BrainCircuit size={16} />
                  Run doctor triage
                </button>
              )}
            </div>
          </section>
        )}

        {sessionUser.role === 'citizen' && (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Citizen records</p>
                  <h3>Your health history</h3>
                </div>
                <button type="button" className="ghost-button">
                  <Users size={16} />
                  Personal record
                </button>
              </div>

              <div className="record-list">
                {citizenRecords.map((record) => (
                  <article key={record.id} className="record-card">
                    <div>
                      <strong>{record.name}</strong>
                      <p>{record.condition}</p>
                    </div>
                    <div className="record-stats">
                      <span>{record.heartRate} bpm</span>
                      <span>{record.spo2}% SpO2</span>
                      <span className={`risk-chip risk-${record.risk.toLowerCase()}`}>ESI {record.esiLevel}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Documents</p>
                  <h3>Citizen uploads</h3>
                </div>
                <label className="primary-button upload-button">
                  <Upload size={16} />
                  Upload docs
                  <input type="file" multiple hidden onChange={(event) => addUploads(event.target.files)} />
                </label>
              </div>

              <div className="upload-list">
                {[...(dashboard?.citizen?.documents ?? []), ...appState.uploadedFiles].slice(0, 8).map((file) => (
                  <div key={file.id} className="list-row">
                    <div className="list-leading">
                      <div className="icon-badge">
                        <FileUp size={15} />
                      </div>
                      <div>
                        <strong>{file.name}</strong>
                        <p>{file.kind} · {file.uploadedAt}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} />
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Consent</p>
                  <h3>Citizen-controlled sharing</h3>
                </div>
                <Languages size={18} />
              </div>

              <div className="toggle-list">
                {appState.consents.map((consent) => (
                  <ConsentToggle key={consent.id} item={consent} onToggle={() => toggleConsent(consent.id)} />
                ))}
              </div>
            </section>
          </>
        )}

        {sessionUser.role === 'doctor' && (
          <>
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Doctor roster</p>
                  <h3>Assigned patients</h3>
                </div>
                <button type="button" className="ghost-button">
                  <Users size={16} />
                  Review patients
                </button>
              </div>

              <div className="record-list">
                {doctorPatients.map((record) => (
                  <article key={record.id} className="record-card">
                    <div>
                      <strong>{record.name}</strong>
                      <p>{record.condition}</p>
                    </div>
                    <div className="record-stats">
                      <span>{record.heartRate} bpm</span>
                      <span>{record.spo2}% SpO2</span>
                      <span className={`risk-chip risk-${record.risk.toLowerCase()}`}>ESI {record.esiLevel}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Urgent queue</p>
                  <h3>High-priority triage</h3>
                </div>
                <AlertTriangle size={18} />
              </div>

              <div className="record-list">
                {urgentQueue.map((record) => (
                  <article key={record.id} className="record-card">
                    <div>
                      <strong>{record.name}</strong>
                      <p>{record.condition}</p>
                    </div>
                    <div className="record-stats">
                      <span>{record.heartRate} bpm</span>
                      <span>{record.spo2}% SpO2</span>
                      <span className={`risk-chip risk-${record.risk.toLowerCase()}`}>ESI {record.esiLevel}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel compact-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Handoffs</p>
                  <h3>Doctor notes</h3>
                </div>
                <Stethoscope size={18} />
              </div>

              <div className="tips-stack">
                {(dashboard?.doctor?.handoffNotes ?? []).map((tip) => (
                  <article key={tip} className="tip-card">
                    <strong>Clinical note</strong>
                    <p>{tip}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {sessionUser.role === 'admin' && (
          <>
            <section className="panel operator-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Admin operations</p>
                  <h3>Partner onboarding and feed health</h3>
                </div>
                <Radar size={18} />
              </div>

              <div className="list-stack">
                {adminFeeds.map((feed) => (
                  <div key={feed.id} className="list-row">
                    <div>
                      <strong>{feed.partner}</strong>
                      <p>{feed.format} · latency {feed.latency}</p>
                    </div>
                    <span className={`status-tag status-${feed.status.toLowerCase().replace(/\s+/g, '-')}`}>{feed.status}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Audit trail</p>
                  <h3>Governance and observability</h3>
                </div>
                <Check size={18} />
              </div>

              <div className="timeline">
                {audit.map((event) => (
                  <div key={event.id} className="timeline-row">
                    <div className="timeline-dot" />
                    <div>
                      <strong>{event.action}</strong>
                      <p>{event.actor} · {event.surface}</p>
                    </div>
                    <small>{event.timestamp}</small>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <section className="panel review-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Feedback</p>
              <h3>Shared review stream</h3>
            </div>
            <button type="button" className="ghost-button" onClick={submitReview}>
              <BellRing size={16} />
              Save review
            </button>
          </div>

          <div className="review-compose">
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`star-button ${reviewRating >= value ? 'active' : ''}`}
                  onClick={() => setReviewRating(value)}
                >
                  <Star size={16} />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="Share care quality, triage clarity, or admin operations feedback."
            />
          </div>

          <div className="review-list">
            {appState.reviews.map((review) => (
              <article key={review.id} className="review-card">
                <div className="review-head">
                  <strong>{review.author}</strong>
                  <span>{'★'.repeat(review.rating)}</span>
                </div>
                <p>{review.comment}</p>
                <small>{roleMeta[review.role].label}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="panel compact-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Language and voice</p>
              <h3>Accessibility controls</h3>
            </div>
            <Globe size={18} />
          </div>

          <div className="toolbar-row">
            <select
              className="select-input"
              value={appState.preferredLanguage}
              onChange={(event) => setAppState((current) => ({ ...current, preferredLanguage: event.target.value }))}
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={`segment ${appState.voiceEnabled ? 'active' : ''}`}
              onClick={() => setAppState((current) => ({ ...current, voiceEnabled: !current.voiceEnabled }))}
            >
              <AudioLines size={16} />
              {appState.voiceEnabled ? 'Voice on' : 'Voice off'}
            </button>
          </div>
        </section>

        <section className="panel compact-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">AI suggestions</p>
              <h3>Preventive care insights</h3>
            </div>
            <BrainCircuit size={18} />
          </div>

          <div className="tips-stack">
            {healthTips.map((tip) => (
              <article key={tip.id} className="tip-card">
                <strong>{tip.title}</strong>
                <p>{tip.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function humanizePermission(key: string) {
  return key
    .replace(/^can/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
}

function StatusPill({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: 'good' | 'warn' | 'neutral';
  icon: typeof Cloud;
}) {
  return (
    <div className={`status-pill tone-${tone}`}>
      <Icon size={16} />
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Activity;
}) {
  return (
    <article className="metric-card">
      <div className="metric-head">
        <span>{label}</span>
        <Icon size={16} />
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

function MetricInput({
  label,
  value,
  unit,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="metric-input">
        <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
        <strong>
          {value}
          <small>{unit}</small>
        </strong>
      </div>
    </label>
  );
}

function ConsentToggle({ item, onToggle }: { item: ConsentItem; onToggle: () => void }) {
  return (
    <button type="button" className="consent-row" onClick={onToggle}>
      <div>
        <strong>{item.label}</strong>
        <p>{item.description}</p>
      </div>
      <span className={`switch ${item.enabled ? 'enabled' : ''}`}>
        <span />
      </span>
    </button>
  );
}

export default App;
