// 数据库初始化 — SQLite (better-sqlite3)
// ponytail: Vercel 只读文件系统, 数据放 /tmp (实例内持久化, 冷启动重建)
import Database from "better-sqlite3";
import path from "path";
import { existsSync, mkdirSync } from "fs";

const isVercel = !!process.env.VERCEL;
const DB_PATH = isVercel
  ? "/tmp/xiezuoli.db"
  : path.join(process.cwd(), "data", "xiezuoli.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    -- 官媒来源
    CREATE TABLE IF NOT EXISTS media_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('national','provincial','municipal')),
      province TEXT,
      city TEXT,
      url TEXT NOT NULL,
      rss_url TEXT,
      crawler_type TEXT NOT NULL CHECK(crawler_type IN ('rss','html','api')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 文章
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT,
      source_id TEXT NOT NULL REFERENCES media_sources(id),
      source_name TEXT NOT NULL,
      publish_date TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      summary TEXT,
      topic TEXT NOT NULL,
      province TEXT,
      city TEXT,
      word_count INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      is_processed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- AI拆解结果 (JSON存储)
    CREATE TABLE IF NOT EXISTS article_analyses (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL UNIQUE REFERENCES articles(id),
      data TEXT NOT NULL,  -- JSON
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 用户
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      target_exam TEXT,
      target_province TEXT,
      registered_at TEXT DEFAULT (datetime('now'))
    );

    -- 练习记录
    CREATE TABLE IF NOT EXISTS practice_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'anonymous',
      prompt_id TEXT,
      prompt_title TEXT NOT NULL,
      topic TEXT NOT NULL,
      user_content TEXT NOT NULL,
      ai_feedback TEXT,     -- JSON
      score INTEGER,
      mode TEXT NOT NULL,
      word_count INTEGER DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 收藏
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'anonymous',
      article_id TEXT NOT NULL REFERENCES articles(id),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, article_id)
    );

    -- 笔记
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'anonymous',
      article_id TEXT REFERENCES articles(id),
      practice_id TEXT,
      content TEXT NOT NULL,
      quote_text TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 索引
    CREATE INDEX IF NOT EXISTS idx_articles_topic ON articles(topic);
    CREATE INDEX IF NOT EXISTS idx_articles_province ON articles(province);
    CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_id);
    CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(publish_date);
    CREATE INDEX IF NOT EXISTS idx_practice_user ON practice_records(user_id);
  `);
}

// 生成唯一ID
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
