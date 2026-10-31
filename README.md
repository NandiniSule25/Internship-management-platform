# 🎓 Multi-Institution Internship Management Platform (InternSphere)

> An enterprise-grade, role-based platform designed for educational institutions, industry mentors, and students to coordinate internships, allocate sprint deliverables, track daily progress, conduct formal evaluations, and generate cryptographic PDF completion certificates.

[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_18-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_&_Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React_18_&_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

## 🌟 Key Features

### 👑 1. Institution Admin Governance Center
- **Aggregated Analytics:** Real-time visibility into total cohorts (active, pending, completed), active faculty supervisors, enrolled student interns, and average performance scores.
- **Cohort Lifecycle Management:** Create and launch internship cohorts across departments with specific timelines and mentor-intern allocations.
- **Institution Directory:** Searchable directory of faculty mentors and students with contact cards and active workload counters.
- **Executive Audit Reports:** Instant generation of comprehensive institutional audit summaries in PDF format.

### 🎓 2. Mentor Command Center
- **Task Allocation:** Create sprint deliverables with acceptance criteria, priority levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and deadlines.
- **Interactive Kanban Board:** 4 color-coded lanes (`TODO`, `IN_PROGRESS`, `UNDER_REVIEW`, `COMPLETED`) with real-time lane transitions.
- **Review Pipeline:** Review daily work logs, hours spent, and deliverable links (GitHub PRs, Figma, docs).
- **Milestone Evaluations:** Grade interns across Technical Competency, Communication & Teamwork, and Punctuality (1–10 scale) with placement recommendations.

### 🚀 3. Intern Workspace & Certifications
- **Task Tracking:** View allocated sprint tasks, due dates, and real-time urgency indicators.
- **Daily Work Logs:** Submit work progress updates, hours logged, and direct URLs to deliverables.
- **Timeline History:** Full interactive timeline of previous submissions and mentor feedback.
- **Downloadable PDF Certificates:** Download verified, cryptographically audited Performance Reports complete with grading scorecards and faculty signature blocks.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 5 | Reactive Single Page Application (SPA) |
| **Styling** | Tailwind CSS v4, Lucide Icons | Cosmic dark theme, role color-coding, glassmorphism |
| **Backend API** | Node.js, Express.js | RESTful API with modular controllers & routes |
| **Database** | PostgreSQL (Neon Cloud) | Scalable relational storage with SSL wire protocol |
| **ORM** | Prisma Client v5.22 | Type-safe queries, relations, and database migrations |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs` | Salted password hashing and stateless role-based auth |
| **PDF Engine** | PDFKit | Vector-based PDF generation streamed directly to HTTP |
| **Deployment** | Vercel Serverless Functions | Continuous delivery with zero-config API routing |

---

## 📐 System Architecture

```
       ┌────────────────────────────────────────────────────────┐
       │             React + Vite Creative Client               │
       │  [Admin Console]  [Cohorts]  [Kanban]  [Evaluations]   │
       └───────────────────────────┬────────────────────────────┘
                                   │ HTTP (JWT Bearer Token)
       ┌───────────────────────────▼────────────────────────────┐
       │             Express REST API (Vercel Serverless)       │
       │  ├── /api/auth (Register, Login, /me, Institutions)    │
       │  ├── /api/institutions (Metrics, Members Directory)    │
       │  ├── /api/internships (Cohorts CRUD, Status Machine)   │
       │  ├── /api/tasks (Kanban, Deadlines, Daily Work Logs)   │
       │  ├── /api/evaluations (Scorecards, Feedback, Ratings)  │
       │  └── /api/reports (PDFKit Intern & Audit PDF Reports)  │
       └───────────────────────────┬────────────────────────────┘
                                   │ PostgreSQL Wire Protocol (SSL)
       ┌───────────────────────────▼────────────────────────────┐
       │              PostgreSQL Cloud Database (Neon)          │
       │  (institutions, users, internships, tasks,             │
       │   progress_updates, evaluations, report_audits)        │
       └────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema & Entities

The platform manages 7 relational entities in PostgreSQL:

1. **`institutions`**: Organization profile, unique code, contact details, and website.
2. **`users`**: User records with bcrypt hashed credentials, assigned `Role` (`INSTITUTION_ADMIN`, `MENTOR`, `INTERN`), and institution foreign key.
3. **`internships`**: Cohort title, department, dates, status (`PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED`), supervisor mentor, and intern.
4. **`tasks`**: Deliverables with priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), status (`TODO`, `IN_PROGRESS`, `UNDER_REVIEW`, `COMPLETED`), deadline, creator, and assignee.
5. **`progress_updates`**: Daily logs submitted by interns with hours, work URLs, and notes.
6. **`evaluations`**: Faculty milestone scorecards with technical, communication, punctuality, and overall ratings.
7. **`report_audits`**: Audit records tracking every generated PDF report.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or newer)
- npm or pnpm
- PostgreSQL database URL (Neon, Supabase, or local PostgreSQL)

### 1. Clone the Repository
```bash
git clone https://github.com/NandiniSule25/Internship-management-platform.git
cd Internship-management-platform
```

### 2. Configure Environment Variables
Copy the template in `server/.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```
Fill in your PostgreSQL connection string:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```

### 3. Install Dependencies & Synchronize Database
```bash
# Install root, backend, and frontend packages
npm install
npm --prefix server install
npm --prefix client install

# Push schema to PostgreSQL database & seed sample institutions and cohorts
npm --prefix server run prisma:push
npm --prefix server run seed:institutions
npm --prefix server run seed:cohorts
```

### 4. Start the Application
```bash
# Terminal 1: Backend API (Port 5001)
npm run server:start

# Terminal 2: Frontend Client (Port 5173)
npm run client:dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Pre-Seeded Demo Credentials

Use the **Instant One-Click Login** buttons on the login screen or enter the following:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| 👑 **Institution Admin** | `admin.test@ait.edu` | `password123` | Analytics dashboard, cohort creation, user directory, institutional audit PDF |
| 🎓 **Mentor** | `mentor.test@ait.edu` | `password123` | Task allocation, priority assignment, review logs, submit milestone evaluations |
| 🚀 **Intern** | `intern.test@ait.edu` | `password123` | Kanban drag/status, log work hours & GitHub URLs, download verified PDF report |

---

## ☁️ Deployment on Vercel

This repository includes a pre-configured `vercel.json` and `api/index.js` serverless function handler:

1. Import this repository into [Vercel](https://vercel.com/new).
2. Set the following **Environment Variables** in Vercel Project Settings:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: A secure 32+ character random secret.
   - `NODE_ENV`: `production`
3. Click **Deploy**. Vercel will automatically run `npm run vercel-build`, bundle the serverless functions in `/api`, and publish the Vite client.

---

## 📄 License
ISC © 2026 Nandini S Sule
