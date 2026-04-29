CREATE TYPE gebruiker_status AS ENUM ('actief', 'inactief', 'inboarden', 'afboarden');
CREATE TYPE verlof_status AS ENUM ('in_afwachting', 'goedgekeurd', 'afgewezen');
CREATE TYPE training_status AS ENUM ('in_afwachting', 'goedgekeurd', 'afgewezen', 'afgerond');

CREATE TABLE IF NOT EXISTS gebruikers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  wachtwoord_hash VARCHAR(255),
  volledige_naam VARCHAR(255) NOT NULL,
  functie VARCHAR(100),
  geboortedatum DATE,
  geboorteplaats VARCHAR(255),
  nationaliteit VARCHAR(100),
  telefoon VARCHAR(20),
  adres VARCHAR(500),
  belastingnummer TEXT,
  bankrekeningnummer TEXT,
  rsz_nummer TEXT,
  profielfoto_url VARCHAR(500),
  startdatum DATE,
  status gebruiker_status DEFAULT 'actief',
  aangemaakt_op TIMESTAMP DEFAULT NOW(),
  bijgewerkt_op TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documenten (
  id SERIAL PRIMARY KEY,
  gebruiker_id INT REFERENCES gebruikers(id) ON DELETE CASCADE,
  type VARCHAR(50),
  bestand_url VARCHAR(500),
  geupload_op TIMESTAMP DEFAULT NOW(),
  vervaldatum DATE,
  geverifieerd_door_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS verlofallocatie (
  id SERIAL PRIMARY KEY,
  gebruiker_id INT REFERENCES gebruikers(id) ON DELETE CASCADE,
  jaar INT,
  beschikbare_uren DECIMAL(5,2),
  gebruikte_uren DECIMAL(5,2) DEFAULT 0,
  meegenomen_uren DECIMAL(5,2) DEFAULT 0,
  aangemaakt_op TIMESTAMP DEFAULT NOW(),
  UNIQUE(gebruiker_id, jaar)
);

CREATE TABLE IF NOT EXISTS verlofaanvragen (
  id SERIAL PRIMARY KEY,
  gebruiker_id INT REFERENCES gebruikers(id) ON DELETE CASCADE,
  startdatum DATE NOT NULL,
  einddatum DATE NOT NULL,
  uren DECIMAL(5,2),
  verloftype VARCHAR(50),
  status verlof_status DEFAULT 'in_afwachting',
  admin_opmerkingen TEXT,
  admin_id INT REFERENCES gebruikers(id),
  medegedeeld_aan_backoffice BOOLEAN DEFAULT FALSE,
  aangemaakt_op TIMESTAMP DEFAULT NOW(),
  bijgewerkt_op TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ziekmeldingsrapporten (
  id SERIAL PRIMARY KEY,
  gebruiker_id INT REFERENCES gebruikers(id) ON DELETE CASCADE,
  startdatum DATE NOT NULL,
  einddatum DATE NOT NULL,
  reden TEXT,
  briefje_url VARCHAR(500),
  briefje_geupload_op TIMESTAMP,
  doktersbezoek_random BOOLEAN DEFAULT FALSE,
  bevestigd_door_werknemer BOOLEAN,
  aangemaakt_op TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificaten (
  id SERIAL PRIMARY KEY,
  gebruiker_id INT REFERENCES gebruikers(id) ON DELETE CASCADE,
  naam VARCHAR(255),
  type VARCHAR(50),
  bestand_url VARCHAR(500),
  uitgiftedatum DATE,
  vervaldatum DATE,
  herinnering_verzonden BOOLEAN DEFAULT FALSE,
  geupload_op TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trainingsaanvragen (
  id SERIAL PRIMARY KEY,
  gebruiker_id INT REFERENCES gebruikers(id) ON DELETE CASCADE,
  onderwerp VARCHAR(255),
  aangevraagd_voor DATE,
  trainer VARCHAR(255),
  geschatte_kosten DECIMAL(10,2),
  status training_status DEFAULT 'in_afwachting',
  admin_opmerkingen TEXT,
  aangemaakt_op TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracten (
  id SERIAL PRIMARY KEY,
  gebruiker_id INT REFERENCES gebruikers(id) ON DELETE CASCADE,
  type VARCHAR(50),
  bestand_url VARCHAR(500),
  startdatum DATE,
  einddatum DATE,
  status VARCHAR(50),
  ondertekend_op TIMESTAMP,
  aangemaakt_op TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS apparatuur (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50),
  beschrijving VARCHAR(500),
  merk VARCHAR(100),
  model VARCHAR(100),
  nummerplaat VARCHAR(20),
  toegewezen_aan INT REFERENCES gebruikers(id),
  toewijzingsdatum DATE,
  status VARCHAR(50),
  verzekering_vervalt DATE,
  notities TEXT,
  aangemaakt_op TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onderhoudslogboek (
  id SERIAL PRIMARY KEY,
  apparatuur_id INT REFERENCES apparatuur(id) ON DELETE CASCADE,
  gerapporteerd_door INT REFERENCES gebruikers(id),
  onderhoudsdatum DATE,
  type VARCHAR(100),
  beschrijving TEXT,
  kosten DECIMAL(10,2),
  garagenaam VARCHAR(255),
  notities TEXT,
  aangemaakt_op TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluaties (
  id SERIAL PRIMARY KEY,
  gebruiker_id INT REFERENCES gebruikers(id) ON DELETE CASCADE,
  ingeplande_datum TIMESTAMP,
  notities TEXT,
  samenvattings_bestand_url VARCHAR(500),
  admin_evaluatie TEXT,
  afgerond_op TIMESTAMP,
  aangemaakt_op TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS afboarden_checklists (
  id SERIAL PRIMARY KEY,
  gebruiker_id INT REFERENCES gebruikers(id) ON DELETE CASCADE,
  laatste_dag DATE,
  status VARCHAR(50),
  items_to_return TEXT[],
  admin_todos TEXT[],
  bevestigd_op TIMESTAMP,
  aangemaakt_op TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bedrijfsfeestdagen (
  id SERIAL PRIMARY KEY,
  datum DATE UNIQUE,
  naam VARCHAR(255),
  vervangdatum DATE,
  aangemaakt_op TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  ontvanger_email VARCHAR(255),
  onderwerp VARCHAR(500),
  sjabloontype VARCHAR(100),
  gebruiker_id INT REFERENCES gebruikers(id),
  verzonden_op TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS login_codes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES gebruikers(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  attempts INT DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  consumed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);


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
