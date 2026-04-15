INSERT INTO gebruikers (email, volledige_naam, functie, status)
VALUES
  ('ismail.kolkiran@immokeuring.be', 'Ismail Kolkiran', 'Zaakvoerder - Admin', 'actief'),
  ('niels.lever@immokeuring.be', 'Niels Lever', 'Energiedeskundige / Salesmanager', 'actief'),
  ('necmettin.calik@immokeuring.be', 'Necmettin Calik', 'Asbestdeskundige', 'actief'),
  ('ibrahim.duysak@immokeuring.be', 'Ibrahim Duysak', 'Asbestdeskundige', 'actief'),
  ('muhammed.cebeci@immokeuring.be', 'Muhammed Cebeci', 'Asbestdeskundige', 'actief'),
  ('mohamed.bachiri@immokeuring.be', 'Mohamed Bachiri', 'Energiedeskundige', 'actief'),
  ('patrick.cornelis@immokeuring.be', 'Patrick Cornelis', 'Energiedeskundige', 'actief'),
  ('kurt.vandenbossche@immokeuring.be', 'Kurt Vandenbossche', 'Energiedeskundige', 'actief')
ON CONFLICT (email) DO NOTHING;
