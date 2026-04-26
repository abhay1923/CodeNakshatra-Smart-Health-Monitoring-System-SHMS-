<div align="center">

  <!-- Animated Health Banner -->
  <img src="https://capsule-render.vercel.app/api?type=venom&height=300&color=gradient&customColorList=6,11,20&text=SHMS&fontColor=fff&fontSize=90&desc=Smart%20Health%20Monitoring%20System&descSize=20&descAlignY=75&animation=twinkling" alt="SHMS Banner" />

  <br />

  <!-- Badges Row -->
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  </p>
  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>

  <!-- Tagline -->
  <p><em>🩺 An immersive 3D health monitoring portal with role-based access control, AI triage, and real-time analytics.</em></p>

  <!-- Quick Links -->
  <p>
    <a href="#-quick-start"><strong>🚀 Quick Start</strong></a> •
    <a href="#-architecture"><strong>🏗️ Architecture</strong></a> •
    <a href="#-roles--access"><strong>👥 Roles</strong></a> •
    <a href="#-api-reference"><strong>📡 API</strong></a> •
    <a href="#-troubleshooting"><strong>🛠️ Troubleshooting</strong></a>
  </p>

</div>

---

## ✨ Overview

**Smart Health Monitoring System (SHMS)** is a next-generation healthcare platform featuring a **3D immersive dashboard**, secure **role-based access control**, and **AI-powered triage**. Built with modern web technologies, it connects patients, doctors, and administrators in a unified, secure ecosystem.

| Feature | Description |
|---------|-------------|
| 🎨 **3D Immersive UI** | Three.js powered dashboard with glassmorphism design |
| 🔐 **Secure Auth** | Supabase authentication with JWT verification via `jose` |
| 🏥 **Role-Based Access** | Citizen, Doctor, and Admin portals with tailored experiences |
| 🤖 **AI Triage** | Emergency Severity Index (ESI) level assessment |
| 📱 **Responsive** | Mobile-first design with PWA capabilities |
| 🐳 **Docker Ready** | Full containerization with docker-compose |

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React 18 + Vite]
        B[Tailwind CSS + Three.js]
        C[Lucide Icons]
    end

    subgraph "Authentication"
        D[Supabase Auth]
        E[JWT Verification]
    end

    subgraph "Backend Layer"
        F[Express.js]
        G[Role Middleware]
        H[Protected APIs]
    end

    subgraph "Data Layer"
        I[PostgreSQL]
        J[Redis Cache]
    end

    A --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    H --> J

    style A fill:#61DAFB,stroke:#20232A,color:#000
    style F fill:#339933,stroke:#000,color:#fff
    style D fill:#3ECF8E,stroke:#000,color:#fff
    style I fill:#336791,stroke:#000,color:#fff
```

---

## 👥 Roles & Access

<table>
  <tr>
    <td width="33%" align="center">
      <h3>👤 Citizen</h3>
      <img src="https://img.shields.io/badge/Portal-Patient-4F46E5?style=flat-square" alt="Citizen" />
      <br /><br />
      <ul align="left">
        <li>📋 Personal health records</li>
        <li>📁 Document uploads</li>
        <li>🔒 Consent management</li>
        <li>⭐ Reviews & feedback</li>
        <li>📊 Vitals monitoring</li>
      </ul>
    </td>
    <td width="33%" align="center">
      <h3>🩺 Doctor</h3>
      <img src="https://img.shields.io/badge/Portal-Clinician-059669?style=flat-square" alt="Doctor" />
      <br /><br />
      <ul align="left">
        <li>👥 Patient roster access</li>
        <li>🚨 Urgent triage queue</li>
        <li>🤖 AI triage controls</li>
        <li>📈 Care workflow data</li>
        <li>🔄 Patient handoff tools</li>
      </ul>
    </td>
    <td width="33%" align="center">
      <h3>🛡️ Admin</h3>
      <img src="https://img.shields.io/badge/Portal-Operator-DC2626?style=flat-square" alt="Admin" />
      <br /><br />
      <ul align="left">
        <li>📡 Partner feed health</li>
        <li>📋 Audit & governance</li>
        <li>📊 Operational metrics</li>
        <li>🔧 System controls</li>
        <li>👤 User management</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | `>= 18.0.0` |
| npm | `>= 9.0.0` |
| Docker (optional) | `>= 20.0.0` |

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd smart-health-monitoring-system

# Install all dependencies
npm run install-all
```

### 2️⃣ Environment Setup

<details>
<summary>🔧 <strong>Frontend Environment</strong> <code>frontend/patient-portal/.env.local</code></summary>
<br />

```env
VITE_SUPABASE_URL=https://ssleaezheghgxrnoqjkp.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3001
```

</details>

<details>
<summary>🔧 <strong>Backend Environment</strong> <code>backend/.env</code></summary>
<br />

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://shms_user:shms_password@localhost:5432/shms_db?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGINS=http://localhost:3000
SUPABASE_URL=https://ssleaezheghgxrnoqjkp.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

> 💡 **Note:** `DATABASE_URL` and `REDIS_URL` are for future expansion. The current auth flow works with Supabase directly.

</details>

### 3️⃣ Run the Application

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend/patient-portal
npm run dev
```

Or use the combined dev command:

```bash
npm run dev
```

| Service | URL | Health Check |
|---------|-----|--------------|
| 🎨 Frontend | [http://localhost:3000](http://localhost:3000) | - |
| ⚙️ Backend | [http://localhost:3001](http://localhost:3001) | [`/health`](http://localhost:3001/health) |

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# Stop services
docker-compose down
```

---

## 📡 API Reference

### 🔓 Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health check |
| `GET` | `/api/v1` | API version info |

### 🔐 Protected Endpoints (Requires Bearer Token)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/v1/auth/session` | All | Current user session |
| `GET` | `/api/v1/dashboard` | All | Role-based dashboard data |
| `GET` | `/api/v1/citizen/records` | Citizen | Personal health records |
| `POST` | `/api/v1/citizen/consents/:id` | Citizen | Update consent settings |
| `GET` | `/api/v1/doctor/patients` | Doctor | Patient roster |
| `POST` | `/api/v1/doctor/triage` | Doctor | Run triage assessment |
| `GET` | `/api/v1/admin/feeds` | Admin | Partner feed health |
| `GET` | `/api/v1/admin/audit` | Admin | Audit logs |

---

## 🔐 Authentication

### Sign Up Flow

1. Navigate to the login screen
2. Select your role: `citizen`, `doctor`, or `admin`
3. The role is stored in Supabase user metadata

### Email Confirmation

If you see "email not confirmed":

- ✅ **Option 1:** Check your inbox and confirm the email
- ⚡ **Option 2:** Disable confirmation in Supabase:
  - `Authentication` → `Providers` → `Email` → Turn off required confirmation

---

## 🛠️ Troubleshooting

<details>
<summary>❌ <strong>Frontend says backend is offline</strong></summary>
<br />

Ensure the backend is running:

```bash
cd backend
npm run dev
```

Test connectivity:
```bash
curl http://localhost:3001/health
```

</details>

<details>
<summary>❌ <strong>ERR_CONNECTION_REFUSED</strong></summary>
<br />

The dev server stopped. Restart both services:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend/patient-portal && npm run dev
```

</details>

<details>
<summary>❌ <strong>Supabase connected but login fails</strong></summary>
<br />

- Verify `VITE_SUPABASE_URL` in `.env.local`
- Confirm the anon key is valid
- Check if email confirmation is required

</details>

---

## 📁 Project Structure

```text
smart-health-monitoring-system/
├── 🎨 frontend/
│   └── patient-portal/
│       ├── src/
│       │   ├── App.tsx          # Main 3D immersive app
│       │   ├── main.tsx         # Entry point
│       │   └── lib/
│       │       ├── api.ts       # API client
│       │       ├── demo-data.ts # Demo state & health tips
│       │       └── supabase.ts  # Auth client
│       ├── package.json
│       └── vite.config.ts
│
├── ⚙️ backend/
│   ├── src/
│   │   ├── index.ts             # Express server & JWT middleware
│   │   └── prisma/
│   │       └── schema.prisma    # Database schema
│   ├── package.json
│   └── Dockerfile
│
├── 🐳 docker-compose.yml
└── 📖 README.md
```

---

## 🛡️ Security

- ✅ **JWT Verification** — All protected routes validate Supabase JWTs via `jose`
- ✅ **Role Middleware** — Express middleware enforces role-based access
- ✅ **CORS Protection** — Configured origins only
- ✅ **Bcrypt Hashing** — Passwords hashed with 12 rounds
- ✅ **HIPAA Ready** — Consent management and audit trails built-in

---

## 👨‍💻 Contributors

<table>
  <tr>
    <td align="center">
      <a href="#">
        <img src="https://img.shields.io/badge/Abhay_Kaushik-Developer-4F46E5?style=for-the-badge" alt="Abhay Kaushik" />
      </a>
    </td>
    <td align="center">
      <a href="#">
        <img src="https://img.shields.io/badge/Ayushi_Bendal-Developer-EC4899?style=for-the-badge" alt="Ayushi Bendal" />
      </a>
    </td>
  </tr>
</table>

---

<div align="center">

  ### ⭐ Star this repo if you found it helpful!

  <br />

  <img src="https://img.shields.io/github/stars/yourusername/smart-health-monitoring-system?style=social" alt="Stars" />
  <img src="https://img.shields.io/github/forks/yourusername/smart-health-monitoring-system?style=social" alt="Forks" />

  <br /><br />

  **Made with 💙 for better healthcare.**

  <br />

  <sub>Licensed under <a href="LICENSE">MIT License</a></sub>

</div>

