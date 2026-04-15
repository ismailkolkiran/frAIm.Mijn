# Deployment Runbook (Combell)

## 1) Server voorbereiding
- Maak PostgreSQL database + gebruiker aan in cPanel.
- Zet Node.js app runtime op juiste versie (>= 18).
- Configureer domein/subdomein naar app (`mijn.immokeuring.be`).
- Activeer SSL (Let's Encrypt).

## 2) Secrets en config
Maak `.env.local` met minimaal:
- `DATABASE_URL`
- `JWT_SECRET`
- `CLOUDINARY_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `APP_BASE_URL`
- `NEXT_PUBLIC_API_BASE`

## 3) Build + migraties
```bash
npm install
npm run db:schema
npm run db:seed
npm run db:holidays
npm run db:onboarding
npm run build
```

## 4) Start
```bash
npm run start
```

## 5) Post-deploy checks
- Controleer health endpoint: `GET /api/health`
- Controleer login magic link flow
- Controleer upload (document + foto)
- Controleer admin routes

## 6) Cron jobs (aanbevolen)
- Ziekbrief herinneringen: `npm run jobs:sick-reminders` (bijv. elk uur)
- Certificaat reminders: `npm run jobs:certificate-reminders` (dagelijks)
- Maandelijkse summary: `npm run jobs:monthly-admin-summary` (maandelijks)
