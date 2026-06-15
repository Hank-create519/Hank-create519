// ============================================================
// Hank个人工作室 AI审查系统 · 数据库操作层
// ============================================================

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import type { AIConfig, ReviewTask, ReviewOutput, FinalReport } from '../types';
import { SCHEMA } from './schema';
import { createDefaultAIConfigs } from '../types';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

// ============ 初始化 ============

export async function initDatabase(_dataPath?: string): Promise<void> {
  SQL = await initSqlJs();
  db = new SQL.Database();

  db.run(SCHEMA);

  // 检查是否需要导入默认配置
  const count = db.exec('SELECT COUNT(*) as c FROM configs')[0];
  if (count && count.values[0][0] === 0) {
    seedDefaults();
  }

  // 迁移: 轮次裁判 → 准备段
  db.run(`UPDATE configs SET phase = 'prep' WHERE role_key = 'round_judge' AND phase = 'debate_summarizer'`);
}

function seedDefaults() {
  const defaults = createDefaultAIConfigs();
  const stmt = db!.prepare(`
    INSERT OR REPLACE INTO configs
    (role_key, role_name, phase, provider, api_key, base_url, model_name,
     temperature, max_tokens, is_enabled, system_prompt, enable_web_search, skills)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of defaults) {
    stmt.run([
      c.roleKey, c.roleName, c.phase, c.provider,
      c.apiKey, c.baseUrl, c.modelName, c.temperature,
      c.maxTokens, c.isEnabled ? 1 : 0, c.systemPrompt,
      c.enableWebSearch ? 1 : 0, JSON.stringify(c.skills),
    ]);
  }
  stmt.free();
}

// ============ 导出/导入 ============

export function exportData(): Uint8Array {
  return db!.export();
}

function mapConfig(row: any[]): AIConfig {
  return {
    id: row[0],
    roleKey: row[1],
    roleName: row[2],
    phase: row[3],
    provider: row[4],
    apiKey: row[5],
    baseUrl: row[6],
    modelName: row[7],
    temperature: row[8],
    maxTokens: row[9],
    isEnabled: row[10] === 1,
    systemPrompt: row[11],
    enableWebSearch: row[12] === 1,
    skills: JSON.parse(row[13] || '[]'),
  };
}

function mapTask(row: any[]): ReviewTask {
  return {
    id: String(row[0]),
    title: row[1],
    status: row[2],
    totalRounds: row[3],
    createdAt: row[5],
    completedAt: row[6],
    errorMessage: row[7],
  };
}

function mapOutput(row: any[]): ReviewOutput {
  return {
    id: row[0],
    roundNumber: row[2],
    roleName: row[3],
    roleKey: row[4],
    status: row[5],
    outputContent: row[6],
    responseTimeMs: row[7],
  };
}

// ============ 配置 CRUD ============

export function getAllConfigs(): AIConfig[] {
  const result = db!.exec('SELECT * FROM configs ORDER BY id');
  if (!result.length) return [];
  return result[0].values.map(mapConfig);
}

export function getConfig(roleKey: string): AIConfig | null {
  const stmt = db!.prepare('SELECT * FROM configs WHERE role_key = ?');
  stmt.bind([roleKey]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return mapConfig(Object.values(row));
  }
  stmt.free();
  return null;
}

export function updateConfig(roleKey: string, patch: Partial<AIConfig>): void {
  const fields: string[] = [];
  const values: any[] = [];

  if (patch.provider !== undefined) { fields.push('provider = ?'); values.push(patch.provider); }
  if (patch.apiKey !== undefined) { fields.push('api_key = ?'); values.push(patch.apiKey); }
  if (patch.baseUrl !== undefined) { fields.push('base_url = ?'); values.push(patch.baseUrl); }
  if (patch.modelName !== undefined) { fields.push('model_name = ?'); values.push(patch.modelName); }
  if (patch.temperature !== undefined) { fields.push('temperature = ?'); values.push(patch.temperature); }
  if (patch.maxTokens !== undefined) { fields.push('max_tokens = ?'); values.push(patch.maxTokens); }
  if (patch.isEnabled !== undefined) { fields.push('is_enabled = ?'); values.push(patch.isEnabled ? 1 : 0); }
  if (patch.systemPrompt !== undefined) { fields.push('system_prompt = ?'); values.push(patch.systemPrompt); }
  if (patch.enableWebSearch !== undefined) { fields.push('enable_web_search = ?'); values.push(patch.enableWebSearch ? 1 : 0); }
  if (patch.skills !== undefined) { fields.push('skills = ?'); values.push(JSON.stringify(patch.skills)); }

  if (fields.length === 0) return;

  fields.push("updated_at = datetime('now')");
  values.push(roleKey);

  db!.run(`UPDATE configs SET ${fields.join(', ')} WHERE role_key = ?`, values);
}

export function saveAllConfigs(configs: AIConfig[]): void {
  db!.run('DELETE FROM configs');
  const stmt = db!.prepare(`
    INSERT INTO configs
    (role_key, role_name, phase, provider, api_key, base_url, model_name,
     temperature, max_tokens, is_enabled, system_prompt, enable_web_search, skills)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of configs) {
    stmt.run([
      c.roleKey, c.roleName, c.phase, c.provider,
      c.apiKey, c.baseUrl, c.modelName, c.temperature,
      c.maxTokens, c.isEnabled ? 1 : 0, c.systemPrompt,
      c.enableWebSearch ? 1 : 0, JSON.stringify(c.skills),
    ]);
  }
  stmt.free();
}

// ============ 任务 CRUD ============

export function createTask(task: ReviewTask & { userInput?: string }): void {
  db!.run(
    `INSERT INTO tasks (id, title, status, total_rounds, user_input, created_at, completed_at, error_message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [task.id, task.title, task.status, task.totalRounds, task.userInput || '',
     task.createdAt, task.completedAt || null, task.errorMessage || null]
  );
}

export function updateTaskStatus(id: string, status: string, errorMessage?: string): void {
  if (status === 'completed') {
    db!.run(
      "UPDATE tasks SET status = ?, completed_at = datetime('now'), error_message = ? WHERE id = ?",
      [status, errorMessage || null, id]
    );
  } else {
    db!.run(
      'UPDATE tasks SET status = ?, error_message = ? WHERE id = ?',
      [status, errorMessage || null, id]
    );
  }
}

export function getTask(id: string): ReviewTask | null {
  const stmt = db!.prepare('SELECT * FROM tasks WHERE id = ?');
  stmt.bind([id]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return mapTask(Object.values(row));
  }
  stmt.free();
  return null;
}

export function getAllTasks(): ReviewTask[] {
  const result = db!.exec('SELECT * FROM tasks ORDER BY created_at DESC');
  if (!result.length) return [];
  return result[0].values.map(mapTask);
}

export function deleteTask(id: string): void {
  db!.run('DELETE FROM tasks WHERE id = ?', [id]);
}

// ============ 输出 CRUD ============

export function saveOutput(output: ReviewOutput & { taskId: string }): void {
  db!.run(
    `INSERT OR REPLACE INTO outputs (id, task_id, round_number, role_name, role_key, status, output_content, response_time_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [output.id, output.taskId, output.roundNumber, output.roleName, output.roleKey,
     output.status, output.outputContent, output.responseTimeMs]
  );
}

export function saveOutputs(outputs: (ReviewOutput & { taskId: string })[]): void {
  const stmt = db!.prepare(
    `INSERT OR REPLACE INTO outputs (id, task_id, round_number, role_name, role_key, status, output_content, response_time_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const o of outputs) {
    stmt.run([o.id, o.taskId, o.roundNumber, o.roleName, o.roleKey, o.status, o.outputContent, o.responseTimeMs]);
  }
  stmt.free();
}

export function getTaskOutputs(taskId: string): ReviewOutput[] {
  const stmt = db!.prepare('SELECT * FROM outputs WHERE task_id = ? ORDER BY id');
  stmt.bind([taskId]);
  const results: ReviewOutput[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(mapOutput(Object.values(row)));
  }
  stmt.free();
  return results;
}

// ============ 报告 CRUD ============

export function saveReport(report: FinalReport): void {
  db!.run(
    `INSERT OR REPLACE INTO final_reports (task_id, report_content, generated_at)
     VALUES (?, ?, ?)`,
    [report.taskId, report.reportContent, report.generatedAt]
  );
}

export function getReport(taskId: string): FinalReport | null {
  const stmt = db!.prepare('SELECT * FROM final_reports WHERE task_id = ?');
  stmt.bind([taskId]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return {
      taskId: String(row.task_id),
      reportContent: String(row.report_content),
      generatedAt: String(row.generated_at),
    };
  }
  stmt.free();
  return null;
}

// ============ 清理 ============

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
