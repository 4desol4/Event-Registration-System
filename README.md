# Event Registration System

This repository contains a full-stack event registration system with a React/Vite frontend and an Express/Prisma backend.

## Production Build

### 1. Install dependencies

```bash
cd frontend
npm install
cd ../backend
npm install
```

### 2. Configure environment

Copy the example env files and set production values.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Important backend values:

- `DATABASE_URL`: your Postgres connection string
- `JWT_SECRET`: strong random secret
- `BASE_URL`: public backend URL
- `CORS_ORIGINS`: allowed frontend origins
- `SERVE_FRONTEND=true`: serve built frontend from backend in production

Frontend env:

- `VITE_API_BASE_URL`: backend API URL

### 3. Build the frontend

```bash
cd frontend
npm run build
```

### 4. Build the backend

```bash
cd ../backend
npm run build
```

### 5. Run the backend server

```bash
cd backend
npm start
```

The backend will serve the frontend from `../frontend/dist` when `SERVE_FRONTEND=true`.

## Deployment Notes

- Use a process manager like PM2, systemd, or Docker for production.
- Ensure `NODE_ENV=production` and `JWT_SECRET` is a secure value.
- Use HTTPS in production.
- The backend listens on `PORT`.

## Local development

Frontend:

```bash
cd frontend
npm run dev
```

Backend:

```bash
cd backend
npm run dev
```

```
Event-Reg-Systems
├─ backend
│  ├─ .env
│  ├─ .env.example
│  ├─ dist
│  │  ├─ index.js
│  │  ├─ index.js.map
│  │  ├─ lib
│  │  │  ├─ audit.js
│  │  │  ├─ audit.js.map
│  │  │  ├─ prisma.js
│  │  │  └─ prisma.js.map
│  │  ├─ middleware
│  │  │  ├─ auth.js
│  │  │  ├─ auth.js.map
│  │  │  ├─ errorHandler.js
│  │  │  └─ errorHandler.js.map
│  │  ├─ routes
│  │  │  ├─ auth.js
│  │  │  ├─ auth.js.map
│  │  │  ├─ events.js
│  │  │  ├─ events.js.map
│  │  │  ├─ forms.js
│  │  │  ├─ forms.js.map
│  │  │  ├─ submissions.js
│  │  │  ├─ submissions.js.map
│  │  │  ├─ users.js
│  │  │  └─ users.js.map
│  │  └─ utils
│  │     ├─ excelExport.js
│  │     ├─ excelExport.js.map
│  │     ├─ qrcode.js
│  │     ├─ qrcode.js.map
│  │     ├─ slug.js
│  │     ├─ slug.js.map
│  │     ├─ validators.js
│  │     └─ validators.js.map
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ prisma
│  │  ├─ migrations
│  │  │  ├─ 20260705052704_init
│  │  │  │  └─ migration.sql
│  │  │  ├─ 20260718000000_add_formfield_description
│  │  │  │  └─ migration.sql
│  │  │  └─ migration_lock.toml
│  │  ├─ schema.prisma
│  │  └─ seed.ts
│  ├─ src
│  │  ├─ index.ts
│  │  ├─ lib
│  │  │  ├─ audit.ts
│  │  │  └─ prisma.ts
│  │  ├─ middleware
│  │  │  ├─ auth.ts
│  │  │  └─ errorHandler.ts
│  │  ├─ routes
│  │  │  ├─ auth.ts
│  │  │  ├─ events.ts
│  │  │  ├─ forms.ts
│  │  │  ├─ submissions.ts
│  │  │  └─ users.ts
│  │  ├─ types
│  │  │  └─ express.d.ts
│  │  └─ utils
│  │     ├─ excelExport.ts
│  │     ├─ qrcode.ts
│  │     ├─ slug.ts
│  │     └─ validators.ts
│  └─ tsconfig.json
├─ frontend
│  ├─ dist
│  │  ├─ android-chrome-192x192.png
│  │  ├─ android-chrome-512x512.png
│  │  ├─ apple-touch-icon.png
│  │  ├─ assets
│  │  │  ├─ AdminDashboardPage-CzLxolho.js
│  │  │  ├─ api-D4FeAcZ-.js
│  │  │  ├─ circle-B-zneoOW.js
│  │  │  ├─ circle-check-D115tfgO.js
│  │  │  ├─ download-7axnlytg.js
│  │  │  ├─ EventDetailPage-tbZXQKw7.js
│  │  │  ├─ EventsListPage-DJ-dcELu.js
│  │  │  ├─ file-text-DwDNLhMP.js
│  │  │  ├─ FormBuilderPage-UW1Gxxvr.js
│  │  │  ├─ index-BU6TSqYE.js
│  │  │  ├─ index-Dq1BYbzS.css
│  │  │  ├─ loader-circle-DcT8dvy-.js
│  │  │  ├─ LoginPage-BTJFjj6V.js
│  │  │  ├─ Modal-ByukiJ2F.js
│  │  │  ├─ RegisterPage-CGWJofXe.js
│  │  │  ├─ slash--wMhClWM.js
│  │  │  ├─ socket-Dlje7THQ.js
│  │  │  ├─ StaffDashboardPage-DIYyI55T.js
│  │  │  ├─ SubmissionsDashboardPage-hVwzXJ8D.js
│  │  │  ├─ SuperAdminDashboardPage-4EVTQr1i.js
│  │  │  ├─ TemplateLibraryPage-Dpk36kqJ.js
│  │  │  ├─ trash-2-BBkFUNtX.js
│  │  │  ├─ triangle-alert-CuuG3aN9.js
│  │  │  ├─ type-DoGBl0Sj.js
│  │  │  ├─ UserManagementPage-BWK6PWIA.js
│  │  │  └─ vendor-8aT1A69B.js
│  │  ├─ favicon-16x16.png
│  │  ├─ favicon-32x32.png
│  │  ├─ favicon.ico
│  │  └─ index.html
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ android-chrome-192x192.png
│  │  ├─ android-chrome-512x512.png
│  │  ├─ apple-touch-icon.png
│  │  ├─ favicon-16x16.png
│  │  ├─ favicon-32x32.png
│  │  └─ favicon.ico
│  ├─ src
│  │  ├─ App.tsx
│  │  ├─ assets
│  │  │  ├─ bg.png
│  │  │  ├─ IT (1).jpg
│  │  │  ├─ IT (2).jpg
│  │  │  ├─ IT (3).jpg
│  │  │  ├─ IT (4).jpg
│  │  │  ├─ IT (5).jpg
│  │  │  ├─ IT (6).jpg
│  │  │  ├─ IT (7).jpg
│  │  │  ├─ IT (8).jpg
│  │  │  └─ mlogo.png
│  │  ├─ components
│  │  │  ├─ EditSubmissionModal.tsx
│  │  │  ├─ FieldRenderer.tsx
│  │  │  ├─ FieldRow.tsx
│  │  │  ├─ FormPreviewModal.tsx
│  │  │  ├─ Layout.tsx
│  │  │  ├─ LiveCounter.tsx
│  │  │  ├─ LoadingScreen.tsx
│  │  │  ├─ MinistryFieldCard.tsx
│  │  │  ├─ Modal.tsx
│  │  │  ├─ PreviewPane.tsx
│  │  │  ├─ ProtectedRoute.tsx
│  │  │  ├─ PublishSuccessModal.tsx
│  │  │  ├─ StartFormModal.tsx
│  │  │  ├─ StatusScreen.tsx
│  │  │  ├─ SubmissionsTable.tsx
│  │  │  ├─ SubmissionsViewer.tsx
│  │  │  ├─ SuccessScreen.tsx
│  │  │  └─ ThemeToggle.tsx
│  │  ├─ context
│  │  │  ├─ AuthContext.tsx
│  │  │  └─ ThemeContext.tsx
│  │  ├─ index.css
│  │  ├─ lib
│  │  │  ├─ api.ts
│  │  │  ├─ fieldConfig.ts
│  │  │  ├─ ministryTheme.ts
│  │  │  ├─ socket.ts
│  │  │  ├─ types.ts
│  │  │  ├─ useStaffIdentity.ts
│  │  │  └─ uuid.ts
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ AdminDashboardPage.tsx
│  │  │  ├─ EventDetailPage.tsx
│  │  │  ├─ EventsListPage.tsx
│  │  │  ├─ FormBuilderPage.tsx
│  │  │  ├─ LoginPage.tsx
│  │  │  ├─ RegisterPage.tsx
│  │  │  ├─ StaffDashboardPage.tsx
│  │  │  ├─ SubmissionsDashboardPage.tsx
│  │  │  ├─ SuperAdminDashboardPage.tsx
│  │  │  ├─ TemplateLibraryPage.tsx
│  │  │  └─ UserManagementPage.tsx
│  │  └─ vite-env.d.ts
│  ├─ tailwind.config.js
│  ├─ tsconfig.json
│  ├─ tsconfig.tsbuildinfo
│  ├─ vercel.json
│  └─ vite.config.ts
└─ README.md

```