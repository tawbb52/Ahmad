CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  phone VARCHAR(40),
  role VARCHAR(40) NOT NULL DEFAULT 'viewer',
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  subscription_status VARCHAR(40) NOT NULL DEFAULT 'active',
  plan_id VARCHAR(80),
  subscription_start DATE,
  subscription_end DATE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  model VARCHAR(120) NOT NULL,
  ios_version VARCHAR(40) NOT NULL,
  udid VARCHAR(128) UNIQUE NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  last_activity TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  device_limit INTEGER NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  description TEXT
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(80) REFERENCES plans(id),
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  renewed_manually BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  type VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  expires_at DATE NOT NULL,
  assigned_apps TEXT,
  team_id VARCHAR(80),
  profile_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS activation_codes (
  id UUID PRIMARY KEY,
  code VARCHAR(120) UNIQUE NOT NULL,
  plan_id VARCHAR(80) REFERENCES plans(id),
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  assigned_user VARCHAR(120),
  expires_at DATE NOT NULL,
  uses_left INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY,
  actor VARCHAR(180) NOT NULL,
  action VARCHAR(80) NOT NULL,
  target VARCHAR(160) NOT NULL,
  level VARCHAR(40) NOT NULL DEFAULT 'info',
  details TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
