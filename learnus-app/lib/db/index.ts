import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

/**
 * Открыть соединение с базой данных
 * @returns Promise<Database>
 */
export async function openDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (db) {
    return db;
  }

  const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'learnus.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Включаем внешние ключи
  await db.exec('PRAGMA foreign_keys = ON;');

  return db;
}

/**
 * Закрыть соединение с базой данных
 */
export async function closeDb(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}

/**
 * Инициализировать схему базы данных
 */
export async function initializeDatabase(): Promise<void> {
  const database = await openDb();
  
  try {
    // Создаем таблицы
    await database.exec(`
      -- Таблица учебных программ
      CREATE TABLE IF NOT EXISTS learning_programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Таблица узлов программ
      CREATE TABLE IF NOT EXISTS program_nodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        program_id INTEGER NOT NULL,
        parent_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        position TEXT NOT NULL, -- JSON {x: number, y: number}
        status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started', 'in_progress', 'completed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (program_id) REFERENCES learning_programs(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES program_nodes(id) ON DELETE SET NULL
      );

      -- Таблица прогресса обучения
      CREATE TABLE IF NOT EXISTS learning_progress (
        node_id INTEGER PRIMARY KEY,
        status TEXT NOT NULL CHECK(status IN ('not_started', 'in_progress', 'completed')),
        completed_at DATETIME,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (node_id) REFERENCES program_nodes(id) ON DELETE CASCADE
      );

      -- Таблица истории чата
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id INTEGER,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (node_id) REFERENCES program_nodes(id) ON DELETE CASCADE
      );

      -- Таблица пользовательских настроек
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE,
        theme TEXT DEFAULT 'system' CHECK(theme IN ('light', 'dark', 'system')),
        default_view_mode TEXT DEFAULT 'chat' CHECK(default_view_mode IN ('chat', 'tree', 'kanban', 'list')),
        show_completed_nodes BOOLEAN DEFAULT 1,
        enable_notifications BOOLEAN DEFAULT 1,
        auto_save_interval INTEGER DEFAULT 30,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Таблица курсов обучения
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        topic TEXT NOT NULL,
        level TEXT NOT NULL CHECK(level IN ('beginner', 'intermediate', 'advanced')),
        goal TEXT,
        length TEXT NOT NULL CHECK(length IN ('short', 'medium', 'long')),
        style TEXT NOT NULL CHECK(style IN ('questions', 'practice', 'theory')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Таблица блоков курса
      CREATE TABLE IF NOT EXISTS course_blocks (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('introduction', 'learning', 'practice', 'reflection')),
        title TEXT NOT NULL,
        content TEXT,
        difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
        order_index INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );

      -- Таблица вопросов
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        block_id TEXT NOT NULL,
        text TEXT NOT NULL,
        hint TEXT,
        expected_answer TEXT,
        order_index INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (block_id) REFERENCES course_blocks(id) ON DELETE CASCADE
      );

      -- Таблица сессий обучения
      CREATE TABLE IF NOT EXISTS learning_sessions (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        current_block_id TEXT NOT NULL,
        current_question_index INTEGER DEFAULT 0,
        progress REAL DEFAULT 0,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (current_block_id) REFERENCES course_blocks(id)
      );

      -- Таблица инсайтов
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        block_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('new_understanding', 'conclusion', 'difficulty')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES learning_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (block_id) REFERENCES course_blocks(id)
      );

      -- Таблица прогресса пользователя
      CREATE TABLE IF NOT EXISTS user_course_progress (
        course_id TEXT PRIMARY KEY,
        completed_blocks TEXT, -- JSON массив ID блоков
        total_insights INTEGER DEFAULT 0,
        progress_percentage REAL DEFAULT 0,
        last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );

      -- Таблица истории изменений (для отмены/повтора действий)
      CREATE TABLE IF NOT EXISTS history_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        action TEXT NOT NULL CHECK(action IN ('create', 'update', 'delete', 'move', 'link', 'unlink')),
        entity_type TEXT NOT NULL CHECK(entity_type IN ('program', 'node', 'progress')),
        entity_id TEXT NOT NULL,
        changes TEXT, -- JSON с изменениями
        user_id TEXT
      );

      -- Индексы для производительности
      CREATE INDEX IF NOT EXISTS idx_program_nodes_program ON program_nodes(program_id);
      CREATE INDEX IF NOT EXISTS idx_program_nodes_parent ON program_nodes(parent_id);
      CREATE INDEX IF NOT EXISTS idx_chat_history_node ON chat_history(node_id);
      CREATE INDEX IF NOT EXISTS idx_learning_progress_status ON learning_progress(status);
      CREATE INDEX IF NOT EXISTS idx_history_entries_entity ON history_entries(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_course_blocks_course ON course_blocks(course_id);
      CREATE INDEX IF NOT EXISTS idx_questions_block ON questions(block_id);
      CREATE INDEX IF NOT EXISTS idx_learning_sessions_course ON learning_sessions(course_id);
      CREATE INDEX IF NOT EXISTS idx_insights_session ON insights(session_id);

      -- Триггеры для обновления updated_at
      CREATE TRIGGER IF NOT EXISTS update_learning_programs_timestamp 
        AFTER UPDATE ON learning_programs
        FOR EACH ROW
        BEGIN
          UPDATE learning_programs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;

      CREATE TRIGGER IF NOT EXISTS update_program_nodes_timestamp 
        AFTER UPDATE ON program_nodes
        FOR EACH ROW
        BEGIN
          UPDATE program_nodes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;

      CREATE TRIGGER IF NOT EXISTS update_learning_progress_timestamp 
        AFTER UPDATE ON learning_progress
        FOR EACH ROW
        BEGIN
          UPDATE learning_progress SET updated_at = CURRENT_TIMESTAMP WHERE node_id = NEW.node_id;
        END;

      CREATE TRIGGER IF NOT EXISTS update_user_preferences_timestamp 
        AFTER UPDATE ON user_preferences
        FOR EACH ROW
        BEGIN
          UPDATE user_preferences SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;
    `);

    console.log('Database initialized successfully');
  } finally {
    await database.close();
  }
}

/**
 * Выполнить миграции базы данных
 */
export async function runMigrations(): Promise<void> {
  const database = await openDb();
  
  try {
    // Здесь можно добавить миграции при необходимости
    // Например:
    // await database.exec(`ALTER TABLE learning_programs ADD COLUMN user_id TEXT;`);
    
    console.log('Migrations completed successfully');
  } finally {
    await database.close();
  }
}

/**
 * Проверить состояние базы данных
 */
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  tables: string[];
  error?: string;
}> {
  try {
    const database = await openDb();
    
    // Получаем список таблиц
    const tables = await database.all<{ name: string }[]>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
    );
    
    // Сохраняем результаты перед закрытием
    const tableNames = tables.map(t => t.name);
    
    await database.close();
    
    return {
      isHealthy: true,
      tables: tableNames,
    };
  } catch (error) {
    return {
      isHealthy: false,
      tables: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Типы для результатов запросов
export type DbResult = sqlite3.RunResult;
export type DbRow = Record<string, any>;
