CREATE TABLE IF NOT EXISTS onboarding_dossiers (
  id SERIAL PRIMARY KEY,
  gebruiker_id INT UNIQUE REFERENCES gebruikers(id) ON DELETE CASCADE,
  intake_data JSONB DEFAULT '{}'::jsonb,
  training_ack JSONB DEFAULT '[]'::jsonb,
  contract_getekend BOOLEAN DEFAULT FALSE,
  contract_getekend_op TIMESTAMP,
  equipment_handover JSONB DEFAULT '{}'::jsonb,
  progress_pct INT DEFAULT 0,
  voltooid BOOLEAN DEFAULT FALSE,
  voltooid_op TIMESTAMP,
  aangemaakt_op TIMESTAMP DEFAULT NOW(),
  bijgewerkt_op TIMESTAMP DEFAULT NOW()
);
