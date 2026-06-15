// ============================================================
// 数据库 React Hook 桥接层
// ============================================================

import { useCallback } from 'react';
import type { AIConfig, ReviewTask, ReviewOutput, FinalReport } from '../types';

const api = () => window.electronAPI?.db;

/** 从主进程数据库加载所有配置 */
export async function loadConfigs(): Promise<AIConfig[]> {
  return (await api()?.getConfigs()) || [];
}

/** 更新单个配置 */
export async function updateConfig(roleKey: string, patch: Partial<AIConfig>): Promise<void> {
  await api()?.updateConfig(roleKey, patch);
}

/** 从主进程数据库加载所有任务 */
export async function loadTasks(): Promise<ReviewTask[]> {
  return (await api()?.getTasks()) || [];
}

/** 持久化任务 */
export async function saveTask(task: ReviewTask & { userInput?: string }): Promise<void> {
  await api()?.saveTask(task);
}

/** 更新任务状态 */
export async function updateTaskStatus(id: string, status: string, errorMessage?: string): Promise<void> {
  await api()?.updateTask(id, status, errorMessage);
}

/** 删除任务 */
export async function deleteTask(id: string): Promise<void> {
  await api()?.deleteTask(id);
}

/** 批量保存输出 */
export async function saveOutputs(outputs: (ReviewOutput & { taskId: string })[]): Promise<void> {
  await api()?.saveOutputs(outputs);
}

/** 加载任务输出 */
export async function loadOutputs(taskId: string): Promise<ReviewOutput[]> {
  return (await api()?.getOutputs(taskId)) || [];
}

/** 保存最终报告 */
export async function saveReport(report: FinalReport): Promise<void> {
  await api()?.saveReport(report);
}

/** 加载任务报告 */
export async function loadReport(taskId: string): Promise<FinalReport | null> {
  return (await api()?.getReport(taskId)) || null;
}

/** useDB: 返回所有数据库操作函数（需要在 Electron 环境中使用） */
export function useDB() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  return {
    isElectron,
    loadConfigs: useCallback(() => loadConfigs(), []),
    updateConfig: useCallback((roleKey: string, patch: Partial<AIConfig>) => updateConfig(roleKey, patch), []),
    loadTasks: useCallback(() => loadTasks(), []),
    saveTask: useCallback((task: ReviewTask & { userInput?: string }) => saveTask(task), []),
    updateTaskStatus: useCallback((id: string, status: string, error?: string) => updateTaskStatus(id, status, error), []),
    deleteTask: useCallback((id: string) => deleteTask(id), []),
    saveOutputs: useCallback((outputs: (ReviewOutput & { taskId: string })[]) => saveOutputs(outputs), []),
    loadOutputs: useCallback((taskId: string) => loadOutputs(taskId), []),
    saveReport: useCallback((report: FinalReport) => saveReport(report), []),
    loadReport: useCallback((taskId: string) => loadReport(taskId), []),
  };
}
