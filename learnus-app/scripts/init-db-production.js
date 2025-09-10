const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Определяем путь к базе данных
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'learnus.db');

console.log('Initializing database at:', dbPath);

// Создаем директорию для базы данных если она не существует
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created database directory:', dbDir);
}

// Создаем базу данных
const db = new Database(dbPath);

// Включаем WAL режим для лучшей производительности
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 1000');
db.pragma('temp_store = memory');

console.log('Database connection established');

// Создаем таблицы
const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      avatar_url TEXT,
      email_verified INTEGER DEFAULT 0,
      google_id TEXT,
      user_level TEXT DEFAULT 'Beginner',
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

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      level TEXT NOT NULL,
      modules TEXT, -- JSON string
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      module_id TEXT,
      lesson_id TEXT,
      completed INTEGER DEFAULT 0,
      progress_percentage REAL DEFAULT 0,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
      UNIQUE(user_id, course_id, module_id, lesson_id)
    );

    -- Индексы для оптимизации
    CREATE INDEX IF NOT EXISTS idx_accounts_userId ON accounts(userId);
    CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider, providerAccountId);
    CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(sessionToken);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
    CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);
  `);
};

// Проверяем и создаем таблицы
try {
  createTables();
  console.log('Database tables created successfully!');

  // Проверяем созданные таблицы
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Created tables:', tables.map(t => t.name));

  // Проверяем индексы
  const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'").all();
  console.log('Created indexes:', indexes.map(i => i.name));

  // Проверяем целостность базы данных
  const integrity = db.prepare("PRAGMA integrity_check").get();
  console.log('Database integrity check:', integrity);

} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
} finally {
  db.close();
  console.log('Database initialization completed successfully!');
}
