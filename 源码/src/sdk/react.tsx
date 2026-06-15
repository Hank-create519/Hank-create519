// ============================================================
// 瀚海审查系统 · React Provider + Hook
// ============================================================

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { ReviewEngine } from './engine';
import type {
  AIConfig,
  EngineOptions,
  ReviewTask,
  RoundOutput,
  FinalReport,
  ReviewProgress,
} from '../types';

interface EngineContextValue {
  engine: ReviewEngine;
  task: ReviewTask | null;
  outputs: RoundOutput[];
  finalReport: FinalReport | null;
  progress: ReviewProgress;
  isRunning: boolean;
  isPaused: boolean;
  configs: AIConfig[];
  updateConfigs: (configs: AIConfig[]) => void;
  startReview: (title: string, input: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  supplement: (info: string) => void;
}

const EngineContext = createContext<EngineContextValue | null>(null);

export function ReviewEngineProvider({
  children,
  options,
}: {
  children: React.ReactNode;
  options?: EngineOptions;
}) {
  const engineRef = useRef<ReviewEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new ReviewEngine(options);
  }
  const engine = engineRef.current;

  const [task, setTask] = useState<ReviewTask | null>(null);
  const [outputs, setOutputs] = useState<RoundOutput[]>([]);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [progress, setProgress] = useState<ReviewProgress>({
    phase: 'idle', totalSteps: 0, completedSteps: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [configs, setConfigs] = useState<AIConfig[]>(engine.getConfigs());

  const prevStateRef = useRef<string>('');

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    const sync = () => {
      const s = engine.getState();
      const snapshot = JSON.stringify({
        taskId: s.task?.id, status: s.task?.status,
        phase: s.progress.phase, outputsLen: s.outputs.length,
        isRunning: s.isRunning, isPaused: s.isPaused,
      });
      if (snapshot === prevStateRef.current) return;
      prevStateRef.current = snapshot;

      setTask(s.task);
      setOutputs([...s.outputs]);
      setFinalReport(s.finalReport);
      setProgress({ ...s.progress });
      setIsRunning(s.isRunning);
      setIsPaused(s.isPaused);
    };

    unsubs.push(engine.on('task_created', sync));
    unsubs.push(engine.on('task_complete', sync));
    unsubs.push(engine.on('task_error', sync));
    unsubs.push(engine.on('ai_complete', () => {
      setOutputs([...engine.getState().outputs]);
    }));
    unsubs.push(engine.on('progress', () => {
      setProgress({ ...engine.getState().progress });
    }));
    unsubs.push(engine.on('paused', () => setIsPaused(true)));
    unsubs.push(engine.on('resumed', () => setIsPaused(false)));
    unsubs.push(engine.on('stopped', sync));
    unsubs.push(engine.on('debate_round_complete', sync));

    return () => unsubs.forEach((fn) => fn());
  }, [engine]);

  const startReview = useCallback(async (title: string, input: string) => {
    setIsRunning(true);
    setIsPaused(false);
    setFinalReport(null);
    try {
      await engine.runReview(title, input);
    } finally {
      const s = engine.getState();
      setIsRunning(s.isRunning);
      setIsPaused(s.isPaused);
      setTask(s.task);
      setFinalReport(s.finalReport);
    }
  }, [engine]);

  const updateConfigs = useCallback((newConfigs: AIConfig[]) => {
    engine.updateConfigs(newConfigs);
    setConfigs([...newConfigs]);
  }, [engine]);

  return (
    <EngineContext.Provider
      value={{
        engine,
        task,
        outputs,
        finalReport,
        progress,
        isRunning,
        isPaused,
        configs,
        updateConfigs,
        startReview,
        pause: () => engine.pause(),
        resume: () => engine.resume(),
        stop: () => engine.stop(),
        supplement: (info: string) => engine.supplement(info),
      }}
    >
      {children}
    </EngineContext.Provider>
  );
}

export function useReviewEngine(): EngineContextValue {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error('useReviewEngine must be used within ReviewEngineProvider');
  return ctx;
}
