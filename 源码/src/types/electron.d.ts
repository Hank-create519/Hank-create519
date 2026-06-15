// ============================================================
// ElectronAPI 类型声明
// ============================================================

import type { AIConfig, ReviewTask, ReviewOutput, FinalReport } from '../types';

interface ElectronDB {
  getConfigs(): Promise<AIConfig[]>;
  updateConfig(roleKey: string, patch: Partial<AIConfig>): Promise<void>;
  getTasks(): Promise<ReviewTask[]>;
  saveTask(task: ReviewTask & { userInput?: string }): Promise<void>;
  updateTask(id: string, status: string, errorMessage?: string): Promise<void>;
  deleteTask(id: string): Promise<void>;
  saveOutputs(outputs: (ReviewOutput & { taskId: string })[]): Promise<void>;
  getOutputs(taskId: string): Promise<ReviewOutput[]>;
  saveReport(report: FinalReport): Promise<void>;
  getReport(taskId: string): Promise<FinalReport | null>;
}

interface ElectronAPI {
  setSecureKey(roleKey: string, apiKey: string): Promise<boolean>;
  getSecureKey(roleKey: string): Promise<string | null>;
  deleteSecureKey(roleKey: string): Promise<boolean>;
  db: ElectronDB;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export type { ElectronAPI, ElectronDB };
