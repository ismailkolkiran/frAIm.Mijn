# myfrAIm - ImmoKeuring Personeelsportaal

## Modules opgeleverd
- Authenticatie (magic link + JWT cookie + rate limit)
- Profielbeheer (incl. versleutelde velden)
- Verlofbeheer (werknemer + admin approvals)
- Ziekmeldingen (inclusief 24u reminder job)
- Certificaten & Trainingen (inclusief expiry reminder job)
- Bedrijfsmiddelen/Wagenpark
- Onboarding portal
- Afboarden portal
- Evaluaties
- E-mailhandtekening generator
- Admin dashboard, werknemersbeheer en rapportage exports

## Lokaal starten
1. Kopieer `.env.local.example` naar `.env.local` en vul alle waarden in.
2. Installeer dependencies:
   ```bash
   npm install
   ```
3. Draai database scripts:
   ```bash
   npm run db:schema
   npm run db:seed
   npm run db:holidays
   npm run db:onboarding
   ```
4. Start app:
   ```bash
   npm run dev
   ```

## Jobs
- `npm run jobs:sick-reminders`
- `npm run jobs:certificate-reminders`
- `npm run jobs:monthly-admin-summary`

## Productie
- Zie `DEPLOYMENT.md` voor deploy stappen op Combell.
- Zie `SMOKE_TESTS.md` voor validatie na deploy.
