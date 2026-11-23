-- Himalay leads. Apply with: npm run db:migrate  (idempotent, safe to re-run)

CREATE TABLE IF NOT EXISTS leads (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  kind        text NOT NULL CHECK (kind IN ('distributor', 'catalogue')),
  role        text CHECK (role IN ('Distributor', 'Dealer', 'Customer')),
  name        text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  phone       text NOT NULL CHECK (char_length(phone) BETWEEN 8 AND 16),
  email       text CHECK (char_length(email) <= 120),
  business    text CHECK (char_length(business) <= 120),
  city        text CHECK (char_length(city) <= 80),
  product     text CHECK (char_length(product) <= 120),
  message     text CHECK (char_length(message) <= 2000),
  page        text CHECK (char_length(page) <= 200),
  ip_hash     text,                -- salted SHA-256, never the raw IP
  user_agent  text,
  status      text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed', 'spam'))
);

CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx  ON leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_ip_idx      ON leads (ip_hash, created_at DESC);
-- Duplicate check in api/lead.js (same phone + form within a few minutes).
CREATE INDEX IF NOT EXISTS leads_phone_idx   ON leads (phone, created_at DESC);
