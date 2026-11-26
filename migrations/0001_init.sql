-- Cloudflare D1 Database Schema for CJDUZ Korean (docusync.online)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  password_hash TEXT DEFAULT '',
  auth_provider TEXT DEFAULT 'email',
  verified INTEGER DEFAULT 0,
  roadmap_profile_json TEXT DEFAULT '{}',
  state_json TEXT DEFAULT '{}',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS otp_codes (
  email TEXT NOT NULL,
  purpose TEXT NOT NULL,
  code TEXT NOT NULL,
  payload_json TEXT DEFAULT '{}',
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (email, purpose)
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
