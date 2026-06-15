// ============================================================
// 瀚海审查系统 · 可嵌入 React 组件
// ============================================================

import React, { useState } from 'react';
import { useReviewEngine } from './react';
import type { AIConfig } from '../types';
import { PROVIDER_DEFAULTS } from '../types';

// ==================== ReviewInput ====================

const REVIEW_TYPES = [
  { key: 'business', label: '商业想法审查' },
  { key: 'product', label: '产品方案审查' },
  { key: 'content', label: '内容逻辑审查' },
  { key: 'code', label: '代码方案审查' },
  { key: 'decision', label: '决策分析' },
  { key: 'general', label: '通用审查' },
];

const REVIEW_TYPE_PROMPTS: Record<string, string> = {
  business: '请评估该商业方案的可行性，包括市场规模、竞争格局、盈利模式、风险因素和执行路径。要求：客观、严格、重视可执行性。',
  product: '请审查该产品方案，包括需求合理性、功能设计、技术可行性、用户体验和上线策略。要求：以用户价值为核心，同时考虑技术约束。',
  content: '请审查这段内容的逻辑一致性、事实准确性、论证强度和表达效果。要求：逐段分析，指出逻辑漏洞和事实错误。',
  code: '请审查该代码方案，包括架构设计、技术选型、性能、安全性和可维护性。要求：给出具体的问题定位和改进建议。',
  decision: '请分析该决策，包括选项对比、利弊分析、风险评估和长期影响。要求：提供决策框架和多维度比较。',
  general: '',
};

export function ReviewInput() {
  const { startReview, isRunning } = useReviewEngine();
  const [title, setTitle] = useState('');
  const [input, setInput] = useState('');
  const [type, setType] = useState('business');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !input.trim()) {
      setError('请填写标题和问题描述');
      return;
    }
    if (isRunning) {
      setError('已有审查任务在运行中');
      return;
    }
    const typePrompt = REVIEW_TYPE_PROMPTS[type] || '';
    const fullInput = typePrompt ? `${typePrompt}\n\n用户问题：\n${input}` : input;
    // fire-and-forget：不 await，让 TaskNew 页的 useEffect 检测到 task 后跳转
    startReview(title.trim(), fullInput);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm text-tesla-text-secondary mb-2">审查标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：评估某新能源项目投资可行性"
          className="w-full bg-tesla-surface border border-tesla-border rounded-lg px-4 py-3 text-white placeholder-tesla-text-muted focus:outline-none focus:border-tesla-text-secondary text-sm font-light"
          disabled={isRunning}
        />
      </div>

      <div>
        <label className="block text-sm text-tesla-text-secondary mb-2">审查类型</label>
        <div className="flex flex-wrap gap-2">
          {REVIEW_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-light transition-colors ${
                type === t.key
                  ? 'bg-white text-black'
                  : 'bg-tesla-surface border border-tesla-border text-tesla-text-secondary hover:text-white'
              }`}
              disabled={isRunning}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-tesla-text-secondary mb-2">问题描述</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请详细描述你的问题，包括背景、约束条件、已知信息等..."
          rows={8}
          className="w-full bg-tesla-surface border border-tesla-border rounded-lg px-4 py-3 text-white placeholder-tesla-text-muted focus:outline-none focus:border-tesla-text-secondary text-sm font-light resize-none"
          disabled={isRunning}
        />
      </div>

      {error && <p className="text-tesla-red text-xs">{error}</p>}

      <button
        type="submit"
        disabled={isRunning}
        className={`px-6 py-2.5 rounded-lg text-sm font-light transition-all ${
          isRunning
            ? 'bg-tesla-border text-tesla-text-muted cursor-not-allowed'
            : 'bg-white text-black hover:bg-gray-200'
        }`}
      >
        {isRunning ? '审查进行中...' : '开始审查'}
      </button>
    </form>
  );
}

// ==================== ReviewMonitor ====================

export function ReviewMonitor() {
  const { task, outputs, finalReport, progress, isRunning, isPaused, pause, resume, stop, supplement } = useReviewEngine();
  const [supplementText, setSupplementText] = useState('');
  const [expandedOutputs, setExpandedOutputs] = useState<Set<number>>(new Set());
  const [showReport, setShowReport] = useState(false);

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-tesla-text-muted">
        <svg className="w-12 h-12 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">尚未创建审查任务</p>
      </div>
    );
  }

  // 按 round 分组 outputs
  const grouped = new Map<number, typeof outputs>();
  for (const o of outputs) {
    const key = o.roundNumber;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(o);
  }

  const toggleExpand = (id: number) => {
    setExpandedOutputs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'bg-tesla-green';
    if (status === 'error') return 'bg-tesla-red';
    if (status === 'running') return 'bg-white status-running';
    return 'bg-tesla-text-muted';
  };

  const phaseLabel = (p: string) => {
    const labels: Record<string, string> = { preparation: '准备层', debate: '辩论层', summary: '总结层', completed: '已完成', error: '出错' };
    return labels[p] || p;
  };

  return (
    <div className="space-y-6">
      {/* 状态头 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light">{task.title}</h2>
          <p className="text-xs text-tesla-text-secondary mt-1">
            {phaseLabel(progress.phase)}
            {progress.totalSteps > 0 && ` · ${progress.completedSteps}/${progress.totalSteps}`}
            {progress.currentRound && progress.totalRounds && ` · 第 ${progress.currentRound}/${progress.totalRounds} 轮`}
          </p>
        </div>
        <div className="flex gap-2">
          {isRunning && !isPaused && (
            <button onClick={pause} className="px-3 py-1.5 text-xs rounded border border-tesla-border text-tesla-text-secondary hover:text-white">
              暂停
            </button>
          )}
          {isPaused && (
            <button onClick={resume} className="px-3 py-1.5 text-xs rounded border border-tesla-border text-white hover:bg-tesla-surface">
              继续
            </button>
          )}
          {(isRunning || isPaused) && (
            <button onClick={stop} className="px-3 py-1.5 text-xs rounded border border-tesla-red/50 text-tesla-red hover:bg-tesla-red/10">
              停止
            </button>
          )}
        </div>
      </div>

      {/* 进度条 */}
      {(isRunning || isPaused) && progress.totalSteps > 0 && (
        <div className="h-0.5 bg-tesla-border rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${(progress.completedSteps / progress.totalSteps) * 100}%` }}
          />
        </div>
      )}

      {/* 中途补充信息 */}
      {(isRunning || isPaused) && (
        <div className="flex gap-2">
          <input
            type="text"
            value={supplementText}
            onChange={(e) => setSupplementText(e.target.value)}
            placeholder="补充信息（审查过程中可随时添加）..."
            className="flex-1 bg-tesla-surface border border-tesla-border rounded-lg px-3 py-2 text-white placeholder-tesla-text-muted focus:outline-none focus:border-tesla-text-secondary text-xs font-light"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && supplementText.trim()) {
                supplement(supplementText.trim());
                setSupplementText('');
              }
            }}
          />
          <button
            onClick={() => {
              if (supplementText.trim()) {
                supplement(supplementText.trim());
                setSupplementText('');
              }
            }}
            className="px-3 py-2 text-xs rounded border border-tesla-border text-tesla-text-secondary hover:text-white"
          >
            补充
          </button>
        </div>
      )}

      {/* AI 输出展示 */}
      <div className="space-y-3">
        {Array.from(grouped.entries()).map(([round, items]) => (
          <div key={round} className="border border-tesla-border rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-tesla-surface flex items-center justify-between">
              <span className="text-xs text-tesla-text-secondary font-light">
                {round === 0 ? '准备层' : round === 999 ? '总结层' : `第 ${round} 大轮`}
              </span>
              <span className="text-xs text-tesla-text-muted">{items.length} 个 AI 输出</span>
            </div>
            <div className="divide-y divide-tesla-border">
              {items.map((o) => (
                <div key={o.id}>
                  <button
                    onClick={() => toggleExpand(o.id)}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-tesla-surface/50 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(o.status)}`} />
                    <span className="text-sm font-light flex-1">{o.roleName}</span>
                    {o.responseTimeMs > 0 && (
                      <span className="text-xs text-tesla-text-muted">{(o.responseTimeMs / 1000).toFixed(1)}s</span>
                    )}
                  </button>
                  {expandedOutputs.has(o.id) && (
                    <div className="px-4 pb-3">
                      <pre className="ai-output text-xs text-tesla-text-secondary max-h-96 overflow-y-auto">
                        {o.outputContent || '(等待输出...)'}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 最终报告 */}
      {finalReport && (
        <div className="border border-tesla-green/30 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowReport(!showReport)}
            className="w-full px-4 py-3 bg-tesla-surface flex items-center justify-between text-left"
          >
            <span className="text-sm font-light text-tesla-green">审查报告已完成</span>
            <span className="text-xs text-tesla-text-secondary">{showReport ? '收起' : '展开'}</span>
          </button>
          {showReport && (
            <div className="px-4 pb-4">
              <pre className="ai-output text-xs text-white leading-relaxed max-h-[70vh] overflow-y-auto">
                {finalReport.reportContent}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== ReviewConfig ====================

const PROVIDERS = [
  { key: 'openai', label: 'OpenAI' },
  { key: 'anthropic', label: 'Anthropic (Claude)' },
  { key: 'google', label: 'Google Gemini' },
  { key: 'deepseek', label: 'DeepSeek' },
  { key: 'zhipu', label: '智谱 (GLM)' },
  { key: 'moonshot', label: 'Moonshot' },
  { key: 'baichuan', label: '百川智能' },
  { key: 'qwen', label: '通义千问' },
  { key: 'wenxin', label: '文心一言' },
  { key: 'custom', label: '自定义' },
];

export function ReviewConfig() {
  const { configs, updateConfigs } = useReviewEngine();
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const updateOne = (roleKey: string, patch: Partial<AIConfig>) => {
    const updated = configs.map((c) =>
      c.roleKey === roleKey ? { ...c, ...patch } : c,
    );
    updateConfigs(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <p className="text-xs text-tesla-text-muted">
          ⚠️ 必须为每个 AI 角色填写有效的 API Key，否则审查无法运行。
        </p>
      </div>
      {configs.map((cfg) => {
        const isExpanded = expandedRole === cfg.roleKey;
        return (
          <div key={cfg.roleKey} className="border border-tesla-border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedRole(isExpanded ? null : cfg.roleKey)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-tesla-surface/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-tesla-text-muted w-6">{cfg.id}</span>
                <span className="text-sm font-light">{cfg.roleName}</span>
              </div>
              <span className="text-xs text-tesla-text-secondary">{isExpanded ? '收起' : '配置'}</span>
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3">
                {/* Provider */}
                <div>
                  <label className="block text-xs text-tesla-text-muted mb-1">提供商</label>
                  <select
                    value={cfg.provider}
                    onChange={(e) => {
                      const p = PROVIDER_DEFAULTS[e.target.value];
                      updateOne(cfg.roleKey, {
                        provider: e.target.value,
                        baseUrl: p?.baseUrl || '',
                        modelName: p?.modelName || '',
                      });
                    }}
                    className="w-full bg-tesla-surface border border-tesla-border rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-tesla-text-secondary"
                  >
                    {PROVIDERS.map((p) => (
                      <option key={p.key} value={p.key}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-xs text-tesla-text-muted mb-1">API Key（必填）</label>
                  <input
                    type="password"
                    value={cfg.apiKey}
                    onChange={(e) => updateOne(cfg.roleKey, { apiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full bg-tesla-surface border border-tesla-border rounded px-3 py-2 text-white placeholder-tesla-text-muted text-xs focus:outline-none focus:border-tesla-text-secondary"
                  />
                </div>

                {/* Base URL */}
                <div>
                  <label className="block text-xs text-tesla-text-muted mb-1">Base URL</label>
                  <input
                    type="text"
                    value={cfg.baseUrl}
                    onChange={(e) => updateOne(cfg.roleKey, { baseUrl: e.target.value })}
                    className="w-full bg-tesla-surface border border-tesla-border rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-tesla-text-secondary"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs text-tesla-text-muted mb-1">模型名称</label>
                  <input
                    type="text"
                    value={cfg.modelName}
                    onChange={(e) => updateOne(cfg.roleKey, { modelName: e.target.value })}
                    className="w-full bg-tesla-surface border border-tesla-border rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-tesla-text-secondary"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-xs text-tesla-text-muted mb-1">
                    Temperature: {cfg.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={cfg.temperature}
                    onChange={(e) => updateOne(cfg.roleKey, { temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-xs text-tesla-text-muted mb-1">系统提示词</label>
                  <textarea
                    value={cfg.systemPrompt}
                    onChange={(e) => updateOne(cfg.roleKey, { systemPrompt: e.target.value })}
                    rows={6}
                    className="w-full bg-tesla-surface border border-tesla-border rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-tesla-text-secondary resize-none font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
