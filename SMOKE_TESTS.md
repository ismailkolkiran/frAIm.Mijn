# Smoke Test Checklist

## Auth
- Login pagina laadt
- Magic link email komt aan
- Verifiëren geeft sessiecookie en opent dashboard
- Uitloggen werkt

## Werknemer flows
- Profiel opslaan werkt (incl. encrypted velden)
- Profielfoto upload werkt
- Verlofaanvraag indienen werkt
- Ziekmelding + briefje upload werkt
- Certificaat upload + vervaldatum zichtbaar
- Trainingsaanvraag indienen
- Bedrijfsauto onderhoudsmelding
- Onboarding progress update
- Afboarden bevestiging
- Evaluatie samenvatting upload
- E-mailhandtekening download

## Admin flows
- Dashboard stats + feed laadt
- Werknemer toevoegen/deactiveren/resetten/verwijderen
- Verlof goedkeuren/afwijzen
- Ziekmeldingen overzicht + missing briefje alert
- Training goedkeuren/afwijzen
- Wagenpark voertuig toevoegen + toewijzen
- Onboarding overzicht
- Afboarden checklist initieren + afronden
- Evaluatie plannen + finaliseren
- Rapporten export (leave/sick/compliance/dossier)

## Health
- `/api/health` geeft `ok: true`
