INSERT INTO bedrijfsfeestdagen (datum, naam, vervangdatum)
VALUES
  ('2024-01-01', 'Nieuwjaar', NULL),
  ('2024-04-01', 'Paasmaandag', NULL),
  ('2024-05-01', 'Dag van de Arbeid', NULL),
  ('2024-05-09', 'O.L.H.-Hemelvaart', NULL),
  ('2024-05-20', 'Pinkstermaandag', NULL),
  ('2024-07-21', 'Nationale Feestdag', '2024-07-22'),
  ('2024-08-15', 'O.L.V.-Hemelvaart', NULL),
  ('2024-11-01', 'Allerheiligen', NULL),
  ('2024-11-11', 'Wapenstilstand', NULL),
  ('2024-12-25', 'Kerstmis', NULL),

  ('2025-01-01', 'Nieuwjaar', NULL),
  ('2025-04-21', 'Paasmaandag', NULL),
  ('2025-05-01', 'Dag van de Arbeid', NULL),
  ('2025-05-29', 'O.L.H.-Hemelvaart', NULL),
  ('2025-06-09', 'Pinkstermaandag', NULL),
  ('2025-07-21', 'Nationale Feestdag', NULL),
  ('2025-08-15', 'O.L.V.-Hemelvaart', NULL),
  ('2025-11-01', 'Allerheiligen', '2025-11-03'),
  ('2025-11-11', 'Wapenstilstand', NULL),
  ('2025-12-25', 'Kerstmis', NULL),

  ('2026-01-01', 'Nieuwjaar', NULL),
  ('2026-04-06', 'Paasmaandag', NULL),
  ('2026-05-01', 'Dag van de Arbeid', NULL),
  ('2026-05-14', 'O.L.H.-Hemelvaart', NULL),
  ('2026-05-25', 'Pinkstermaandag', NULL),
  ('2026-07-21', 'Nationale Feestdag', NULL),
  ('2026-08-15', 'O.L.V.-Hemelvaart', '2026-08-17'),
  ('2026-11-01', 'Allerheiligen', '2026-11-02'),
  ('2026-11-11', 'Wapenstilstand', NULL),
  ('2026-12-25', 'Kerstmis', NULL)
ON CONFLICT (datum) DO UPDATE
SET naam = EXCLUDED.naam,
    vervangdatum = EXCLUDED.vervangdatum;
