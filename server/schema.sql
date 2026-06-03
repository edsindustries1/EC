-- Everywhere Cars schema. Idempotent — safe to run on every boot.

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'customer',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_requests (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name   TEXT,
  customer_email  TEXT,
  customer_phone  TEXT,
  pickup          TEXT NOT NULL,
  dropoff         TEXT NOT NULL,
  ride_date       TEXT,
  passengers      INTEGER DEFAULT 1,
  vehicle_type    TEXT DEFAULT 'sedan',
  status          TEXT NOT NULL DEFAULT 'pending',
  bid_price       NUMERIC,
  eta_minutes     INTEGER,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS bids (
  id                SERIAL PRIMARY KEY,
  quote_request_id  INTEGER NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  operator_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  operator_name     TEXT,
  price             NUMERIC NOT NULL,
  vehicle_type      TEXT,
  eta_minutes       INTEGER,
  message           TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drivers (
  id            SERIAL PRIMARY KEY,
  operator_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  vehicle_type  TEXT DEFAULT 'sedan',
  vehicle       TEXT,
  plate         TEXT,
  status        TEXT NOT NULL DEFAULT 'available',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id                SERIAL PRIMARY KEY,
  reference         TEXT NOT NULL UNIQUE,
  customer_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT NOT NULL,
  pickup            TEXT NOT NULL,
  dropoff           TEXT NOT NULL,
  pickup_date       TEXT,
  pickup_time       TEXT,
  passengers        INTEGER DEFAULT 1,
  vehicle_type      TEXT DEFAULT 'sedan',
  trip_type         TEXT DEFAULT 'oneway',
  return_date       TEXT,
  return_time       TEXT,
  route_type        TEXT,
  price_low         NUMERIC,
  price_high        NUMERIC,
  price_quoted      NUMERIC,
  flight_number     TEXT,
  child_seats       INTEGER DEFAULT 0,
  special_requests  TEXT,
  status            TEXT NOT NULL DEFAULT 'confirmed',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_email      ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_reference  ON bookings(reference);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status     ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_quote_request_id     ON bids(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_drivers_operator_id       ON drivers(operator_id);

-- Passwordless email OTP codes
CREATE TABLE IF NOT EXISTS otp_codes (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  consumed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_created ON otp_codes(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at    ON otp_codes(expires_at);
