# Smart Health Monitoring System (SHMS)

A comprehensive full-stack healthcare application integrating manual uploads, partner API imports, ESI triage, patient/clinician portals, operator dashboards, consent management, offline access, multilingual/voice input, and notifications.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Patient Portal │ Clinician Portal│    Operator Portal          │
│  - Upload docs  │ - Monitor pts   │  - Partner onboarding      │
│  - View results │ - Triage alerts │  - DLQ management           │
│  - Voice input  │ - Search records│  - Audit logs               │
│  - Multilingual │ - Consent mgmt  │  - System monitoring        │
└─────────────────┴─────────────────┴─────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                              │
│  OAuth2/JWT Auth │ Rate Limiting │ Request Validation           │
└─────────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND SERVICES                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Ingress APIs   │   Core Services │    AI/ML Engine             │
│  - FHIR/HL7     │  - Validation   │  - ESI Triage               │
│  - CSV/JSON     │  - Mapping      │  - Risk Scoring             │
│  - Bulk Import  │  - Consent Mgmt │  - Anomaly Detection        │
│  - Webhooks     │  - Notifications│  - Health Analytics         │
└─────────────────┴─────────────────┴─────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   PostgreSQL    │     Redis       │    File Storage             │
│  - Patient data │  - Sessions     │  - Documents                │
│  - Encounters   │  - Cache        │  - Medical files            │
│  - Lab results  │  - DLQ          │  - Audit trails             │
│  - Reviews      │  - Jobs         │  - Raw payloads             │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## 🚀 Features

### Patient Portal
- 📄 Upload health documents (CSV, JSON, HL7, PDFs)
- 📊 View lab results, vitals, history, and personalized recommendations
- 🌍 Multilingual support (React-i18next)
- 🎤 Voice-assisted data entry (Speech-to-Text)
- 📱 Offline-first PWA with IndexedDB sync
- 🔒 Consent management UI (grant/revoke)
- ⭐ Doctor review module (1–5 stars + comments)

### Clinician Portal
- 📋 Dashboard for patient monitoring
- 🚨 Real-time triage alerts (ESI levels)
- 🔍 Search patient records (labs, encounters, documents)
- 🔐 Manage patient consents
- 📝 Access reviews/feedback for performance improvement

### Operator Portal
- 🤝 Partner onboarding (API mapping, sandbox keys)
- 🔧 Dead Letter Queue (DLQ) repair tools
- 📊 Audit logs viewer
- 📈 Monitoring dashboards (ingestion errors, job latency, consent violations)

### AI/ML & Triage
- 🏥 Emergency Severity Index (ESI) Engine
- 🤖 Rule-based + ML-assisted triage
- 📈 Risk scoring (chronic disease, readmission prediction)
- 🔍 Anomaly detection in vitals
- 💡 Personalized health tips (preventive care)

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, PWA
- **Backend**: Node.js, Express/NestJS, TypeScript
- **Database**: PostgreSQL, Redis
- **AI/ML**: TensorFlow.js, Python scikit-learn
- **Authentication**: OAuth2, JWT, mTLS
- **Deployment**: Docker, Kubernetes (AKS), Azure services
- **Testing**: Jest, Cypress, k6 load testing

## 📁 Project Structure

```
smart-health-monitoring-system/
├── frontend/                 # React frontend applications
│   ├── patient-portal/      # Patient-facing interface
│   ├── clinician-portal/    # Healthcare provider interface
│   └── operator-portal/     # System admin interface
├── backend/                 # Node.js backend services
│   ├── src/
│   │   ├── api/            # REST API endpoints
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   └── middleware/     # Auth, validation, etc.
├── database/               # Database schemas and migrations
├── ai-engine/             # AI/ML triage and analytics
├── deployment/            # Docker, K8s, CI/CD configs
└── docs/                  # Documentation
```

## 🔧 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd smart-health-monitoring-system
   npm install
   ```

2. **Setup Database**
   ```bash
   docker-compose up -d postgres redis
   npm run db:migrate
   ```

3. **Start Development**
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend (separate terminals)
   cd frontend/patient-portal && npm start
   cd frontend/clinician-portal && npm start
   cd frontend/operator-portal && npm start
   ```

## 🔐 Security Features

- **Authentication**: OAuth2 + JWT + optional mTLS
- **Authorization**: RBAC (patient, clinician, operator roles)
- **Encryption**: TLS (in transit) + AES-256 (at rest)
- **Audit Trails**: Every access logged
- **Consent Enforcement**: Patient-controlled data access

## 🌐 API Documentation

The SHMS provides comprehensive RESTful APIs:

- **Ingress APIs**: `/api/v1/import/*` - Data ingestion
- **Export APIs**: `/api/v1/export/*` - Data export
- **Patient APIs**: `/api/v1/patient/*` - Patient records
- **Webhook APIs**: `/webhooks/*` - External integrations

See [API Documentation](docs/api.md) for detailed endpoints.

## 🚀 Deployment

The system is designed for Azure deployment:

- **AKS** (Kubernetes) for services
- **APIM** for API gateway
- **CosmosDB/PostgreSQL** for persistence
- **Redis** for caching
- **Service Bus** for DLQ + async processing

## 🧪 Testing

- **Unit Tests**: Jest with >80% coverage
- **Integration Tests**: API endpoint testing
- **Load Tests**: k6 performance testing
- **Clinical Validation**: Healthcare workflow testing

## 📊 Monitoring & Observability

- **Metrics**: ingest_rate, error_rate, triage_latency
- **Tracing**: OpenTelemetry end-to-end
- **SLOs**: ingestion <2s, triage notifications <30s

## 🔮 Future Enhancements

- **Blockchain Audit Trail**: Immutable logging
- **AI Doctor Recommendations**: ML-powered clinician ranking
- **IoMT Integration**: Real-time wearable device data
- **Advanced Analytics**: Predictive health modeling

## 📄 License

[MIT License](LICENSE)

## 🤝 Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for contribution guidelines.
