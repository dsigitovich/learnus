import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: './learnus.db',
    driver: sqlite3.Database
  });
}

export async function initDb() {
  const db = await openDb();
  
  // Таблица учебных программ
  await db.exec(`
    CREATE TABLE IF NOT EXISTS learning_programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      current_node_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (current_node_id) REFERENCES program_nodes(id) ON DELETE SET NULL
    )
  `);
  
  // Таблица узлов дерева учебной программы
  await db.exec(`
    CREATE TABLE IF NOT EXISTS program_nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_id INTEGER NOT NULL,
      parent_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      position_x REAL,
      position_y REAL,
      status TEXT DEFAULT 'not_started',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (program_id) REFERENCES learning_programs(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES program_nodes(id) ON DELETE CASCADE
    )
  `);
  
  // Таблица прогресса обучения
  await db.exec(`
    CREATE TABLE IF NOT EXISTS learning_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      completed_at DATETIME,
      notes TEXT,
      FOREIGN KEY (node_id) REFERENCES program_nodes(id) ON DELETE CASCADE
    )
  `);
  
  // Таблица истории чата
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (node_id) REFERENCES program_nodes(id) ON DELETE CASCADE
    )
  `);
  
  // Таблица сессий обучения
  await db.exec(`
    CREATE TABLE IF NOT EXISTS learning_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_id INTEGER NOT NULL,
      node_id INTEGER NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      duration_minutes INTEGER,
      FOREIGN KEY (program_id) REFERENCES learning_programs(id) ON DELETE CASCADE,
      FOREIGN KEY (node_id) REFERENCES program_nodes(id) ON DELETE CASCADE
    )
  `);
  
  // Таблица детального прогресса узлов
  await db.exec(`
    CREATE TABLE IF NOT EXISTS node_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER NOT NULL UNIQUE,
      percentage INTEGER DEFAULT 0,
      time_spent_minutes INTEGER DEFAULT 0,
      last_accessed DATETIME,
      notes TEXT,
      FOREIGN KEY (node_id) REFERENCES program_nodes(id) ON DELETE CASCADE
    )
  `);
  
  await db.close();
}
