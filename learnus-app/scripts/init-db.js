const Database = require('better-sqlite3');
const path = require('path');

// Создаем базу данных
const dbPath = path.join(process.cwd(), 'learnus.db');
const db = new Database(dbPath);

console.log('Creating database at:', dbPath);

// Создаем таблицы
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    email_verified INTEGER DEFAULT 0,
    google_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    sessionToken TEXT UNIQUE NOT NULL,
    userId TEXT NOT NULL,
    expires DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires DATETIME NOT NULL,
    PRIMARY KEY (identifier, token)
  );

  CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts(userId);
  CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, providerAccountId);
  CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(sessionToken);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
`);

console.log('Database tables created successfully!');

// Проверяем созданные таблицы
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Created tables:', tables.map(t => t.name));

db.close();
console.log('Database initialization completed!');
