// ============================================================
// Zustand 状态管理 · 集成 SQLite 持久化
// ============================================================

import { create } from 'zustand';
import type { AIConfig, ReviewTask, RoundOutput, FinalReport } from '../types';
import { createDefaultAIConfigs } from '../types';

interface ReviewStore {
  // AI 配置
  configs: AIConfig[];
  configsLoaded: boolean;
  setConfigs: (configs: AIConfig[]) => void;
  loadConfigs: (configs: AIConfig[]) => void;
  updateOneConfig: (roleKey: string, patch: Partial<AIConfig>) => void;

  // 当前审查
  currentTask: ReviewTask | null;
  setCurrentTask: (t: ReviewTask | null) => void;

  // 输出
  outputs: RoundOutput[];
  setOutputs: (o: RoundOutput[]) => void;
  addOutput: (o: RoundOutput) => void;

  // 最终报告
  finalReport: FinalReport | null;
  setFinalReport: (r: FinalReport | null) => void;

  // 历史
  history: ReviewTask[];
  setHistory: (tasks: ReviewTask[]) => void;
  addHistory: (t: ReviewTask) => void;
  removeHistory: (id: string) => void;

  // UI
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useReviewStore = create<ReviewStore>((set) => ({
  configs: createDefaultAIConfigs(),
  configsLoaded: false,
  setConfigs: (configs) => set({ configs }),
  loadConfigs: (configs) => set({ configs, configsLoaded: true }),
  updateOneConfig: (roleKey, patch) =>
    set((state) => ({
      configs: state.configs.map((c) =>
        c.roleKey === roleKey ? { ...c, ...patch } : c,
      ),
    })),

  currentTask: null,
  setCurrentTask: (t) => set({ currentTask: t }),

  outputs: [],
  setOutputs: (o) => set({ outputs: o }),
  addOutput: (o) => set((state) => ({ outputs: [...state.outputs, o] })),

  finalReport: null,
  setFinalReport: (r) => set({ finalReport: r }),

  history: [],
  setHistory: (tasks) => set({ history: tasks }),
  addHistory: (t) => set((state) => ({ history: [t, ...state.history].slice(0, 100) })),
  removeHistory: (id) => set((state) => ({ history: state.history.filter(t => t.id !== id) })),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
