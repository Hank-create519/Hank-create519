// ============================================================
// Hank个人工作室 AI审查系统 · 数据库 Schema
// ============================================================

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_key TEXT UNIQUE NOT NULL,
  role_name TEXT NOT NULL,
  phase TEXT NOT NULL CHECK(phase IN ('prep','debate','debate_summarizer','summary')),
  provider TEXT NOT NULL,
  api_key TEXT DEFAULT '',
  base_url TEXT DEFAULT '',
  model_name TEXT DEFAULT '',
  temperature REAL DEFAULT 0.3,
  max_tokens INTEGER DEFAULT 4096,
  is_enabled INTEGER DEFAULT 1,
  system_prompt TEXT DEFAULT '',
  enable_web_search INTEGER DEFAULT 0,
  skills TEXT DEFAULT '[]',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'preparing' CHECK(status IN ('preparing','debating','summarizing','completed','error')),
  total_rounds INTEGER NOT NULL DEFAULT 3,
  user_input TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS outputs (
  id INTEGER NOT NULL,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 0,
  role_name TEXT NOT NULL,
  role_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK(status IN ('running','completed','error')),
  output_content TEXT DEFAULT '',
  response_time_ms INTEGER DEFAULT 0,
  PRIMARY KEY (id, task_id)
);

CREATE TABLE IF NOT EXISTS final_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT UNIQUE NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  report_content TEXT NOT NULL DEFAULT '',
  generated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_outputs_task ON outputs(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
`;
