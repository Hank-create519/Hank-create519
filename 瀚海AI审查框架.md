# 瀚海 AI 审查框架 · 完整架构

> Hanhai AI Review Framework — Complete Architecture

## 一、系统定位

不是「一个 AI 回答你」，而是「一个 AI 审查委员会」给用户出报告。
核心机制：多个异构 AI 角色分层协作 → 多轮交叉辩论 → 阶段汇总压缩 → 最终结构化报告。

## 1. System Positioning

Not "an AI that answers you," but "an AI review committee" that produces reports for the user.
Core mechanism: multiple heterogeneous AI roles collaborate in layers → multi-round cross-debate → stage summary compression → final structured report.

---

## 二、三层架构总览

```
用户输入
  │
  ▼
╔══════════════════════════════════════════╗
║  准备层（串行，1 轮）                      ║
║  信息提取 AI → 信息整合 AI → 轮次判定 AI   ║
║  输出：审查任务说明书 + 判定 N 轮数         ║
╚══════════════════════════╤═══════════════╝
                           │
                           ▼
╔══════════════════════════════════════════╗
║  辩论层（N 轮循环，轮内并行，轮间串行）       ║
║                                          ║
║  每一轮：                                  ║
║  ┌──────┐ ┌──────┐ ┌──────┐ ... (N 个)   ║
║  │AI-A  │ │AI-B  │ │AI-C  │    并行       ║
║  │辩论  │ │辩论  │ │辩论  │               ║
║  └──┬───┘ └──┬───┘ └──┬───┘              ║
║     └─────────┼─────────┘                  ║
║               ▼                            ║
║  ┌────────────────────┐                    ║
║  │  阶段汇总 AI 压缩    │                    ║
║  │  共识/分歧/风险/假设  │                   ║
║  └────────┬───────────┘                    ║
║           │ 摘要链传递到下一轮               ║
║           │ + 上轮原始输出交叉审查            ║
╚═══════════╤════════════════════════════════╝
            │
            ▼
╔══════════════════════════════════════════╗
║  总结层（1 轮）                            ║
║  最终总结 AI → 结构化审查报告              ║
║  输入：taskBrief + 完整摘要链              ║
╚══════════════════════════════════════════╝
            │
            ▼
      【审查报告】
  含共识/分歧/风险/未验证假设/行动建议
```

## 2. Three-Layer Architecture Overview

```
User Input
  │
  ▼
╔══════════════════════════════════════════╗
║  Preparation Layer (serial, 1 pass)       ║
║  Info Extraction AI → Info Integration AI ║
║  → Round Judge AI                         ║
║  Output: Review task brief + N round count║
╚══════════════════════════╤═══════════════╝
                           │
                           ▼
╔══════════════════════════════════════════╗
║  Debate Layer (N-round loop, parallel     ║
║  within rounds, serial between rounds)    ║
║                                          ║
║  Each round:                              ║
║  ┌──────┐ ┌──────┐ ┌──────┐ ... (N)     ║
║  │AI-A  │ │AI-B  │ │AI-C  │  parallel    ║
║  │Debate│ │Debate│ │Debate│              ║
║  └──┬───┘ └──┬───┘ └──┬───┘              ║
║     └─────────┼─────────┘                  ║
║               ▼                            ║
║  ┌────────────────────┐                    ║
║  │  Stage Summary AI   │                    ║
║  │  Consensus/Disagree/ │                   ║
║  │  Risk/Assumptions    │                   ║
║  └────────┬───────────┘                    ║
║           │ Summary chain passes to next   ║
║           │ round + previous round raw     ║
║           │ output cross-review            ║
╚═══════════╤════════════════════════════════╝
            │
            ▼
╔══════════════════════════════════════════╗
║  Summary Layer (1 pass)                   ║
║  Final Summary AI → Structured review     ║
║  report                                   ║
║  Input: taskBrief + full summary chain    ║
╚══════════════════════════════════════════╝
            │
            ▼
      [Review Report]
  Includes consensus / disagreements / risks /
  unverified assumptions / action recommendations
```

---

## 三、角色定义

## 3. Role Definitions

### 3.1 准备层（3 个，固定）

| 角色 | 输入 | 输出 |
|---|---|---|
| 信息提取 AI | 用户原始输入 | 结构化信息提取（需求/事实/假设/约束/缺口） |
| 信息整合 AI | 提取结果 + 用户原始输入 | 审查任务说明书（统一输入源） |
| 轮次判定 AI | 审查任务说明书 | 判定 3/5/7/10 大轮 + 每轮重点 |

### 3.1 Preparation Layer (3 roles, fixed)

| Role | Input | Output |
|------|-------|--------|
| Info Extraction AI | Raw user input | Structured info extraction (requirements / facts / assumptions / constraints / gaps) |
| Info Integration AI | Extraction results + raw user input | Review task brief (unified input source) |
| Round Judge AI | Review task brief | Determines 3/5/7/10 major rounds + per-round focus |

### 3.2 辩论层（N 个，可增减）

每个辩论 AI 独立配置：provider / apiKey / modelName / temperature / systemPrompt / skills。

每轮角色变化：
- **第 1 轮**：生成方案（基于 taskBrief 独立分析）
- **第 2 至 N-1 轮**：审查与改进（审查上一轮其他 AI 的原始输出）
- **第 N 轮**：最终验证（综合所有辩论历史）

默认 3 个辩论 AI：
- 逻辑推理 AI（擅长严密推演、找逻辑漏洞）
- 信息检索 AI（擅长外部信息核查、标注可信度）
- 综合判断 AI（擅长平衡取舍、评估可执行性）

### 3.2 Debate Layer (N roles, scalable)

Each debate AI is independently configured: provider / apiKey / modelName / temperature / systemPrompt / skills.

Role changes per round:
- **Round 1**: Generate proposals (independent analysis based on taskBrief)
- **Rounds 2 to N-1**: Critique and improve (review the raw output of other AIs from the previous round)
- **Round N**: Final verification (synthesize all debate history)

Default 3 debate AIs:
- Logical Reasoning AI (skilled in rigorous deduction, finding logical flaws)
- Information Retrieval AI (skilled in external fact-checking, credibility annotation)
- Comprehensive Judgment AI (skilled in balancing trade-offs, assessing feasibility)

### 3.3 汇总与总结（2 个，固定）

| 角色 | 位置 | 输入 | 输出 |
|---|---|---|---|
| 阶段汇总 AI | 辩论层（每轮结束后） | 本轮所有辩论 AI 的原始输出 | 压缩的阶段汇总（共识/分歧/风险/下轮议题） |
| 最终总结 AI | 总结层 | taskBrief + 完整摘要链 | 最终审查报告 |

### 3.3 Summary Roles (2 roles, fixed)

| Role | Position | Input | Output |
|------|----------|-------|--------|
| Stage Summary AI | Debate layer (after each round) | Raw output of all debate AIs in the current round | Compressed stage summary (consensus / disagreements / risks / next-round topics) |
| Final Summary AI | Summary layer | taskBrief + full summary chain | Final review report |

---

## 四、核心算法：辩论循环

## 4. Core Algorithm: Debate Loop

### 4.1 上下文传递规则

```
Round 1 上下文 = taskBrief

Round 2+ 上下文 = taskBrief
                + 完整摘要链（第 1 轮汇总 + 第 2 轮汇总 + ...）
                + 上一轮所有其他辩论 AI 的原始输出（交叉审查用）
```

### 4.1 Context Propagation Rules

```
Round 1 context = taskBrief

Round 2+ context = taskBrief
                 + Full summary chain (Round 1 summary + Round 2 summary + ...)
                 + Raw output of all other debate AIs from the previous round (for cross-review)
```

### 4.2 交叉审查机制

第 2+ 轮，每个辩论 AI 的 prompt 追加：

```
请重点审查上一轮其他 AI 输出中的问题：
- 逻辑漏洞
- 事实错误
- 可执行性缺陷
如果发现错误，明确指出并给出改进方案。
```

同时在上下文中注入上一轮其他 AI 的原始输出（每个截断 3000 字），让 AI 有具体材料可审查。

### 4.2 Cross-Review Mechanism

Starting from round 2, each debate AI's prompt is appended with:

```
Please focus on reviewing issues in the previous round's output of other AIs:
- Logical flaws
- Factual errors
- Feasibility defects
If errors are found, clearly identify them and provide improvement proposals.
```

Additionally, the raw output of other AIs from the previous round is injected into the context (each truncated at 3000 characters), giving the AI concrete material to review.

### 4.3 摘要链

阶段汇总 AI 每轮结束后将 N 个辩论输出压缩为结构化摘要：

```
【共识清单】所有 AI 一致认可的内容
【分歧清单】各方立场 + 分歧内容 + 建议验证方向
【风险清单】被指出但未解决的问题
【未验证假设清单】所有标记为未验证的假设
【下一轮重点议题】具体、可操作的议题列表
```

所有轮次的摘要构成**摘要链**（summaryChain[]），最终总结 AI 拿到的是完整链，而非仅最后一条。

### 4.3 Summary Chain

After each round, the Stage Summary AI compresses N debate outputs into a structured summary:

```
[Consensus List] Content unanimously agreed upon by all AIs
[Disagreement List] Each party's position + points of disagreement + suggested verification direction
[Risk List] Issues identified but unresolved
[Unverified Assumptions List] All assumptions marked as unverified
[Key Topics for Next Round] Specific, actionable topic list
```

Summaries from all rounds form the **summary chain** (summaryChain[]); the Final Summary AI receives the complete chain, not just the last entry.

---

## 五、工具调用框架

## 5. Tool-Calling Framework

### 5.1 支持的 Skill 类型

| Skill | 用途 | 状态 |
|---|---|---|
| `web_search` | 搜索引擎查询 | 框架就绪，待接入 API |
| `skill_github` | GitHub 仓库/代码查询 | 框架就绪，待接入 API |
| `skill_database` | 数据库查询 | 框架就绪，待接入 API |
| `skill_file_system` | 本地文件读写 | 框架就绪 |
| `skill_custom_api` | 自定义 HTTP API | 框架就绪，待配置 |

### 5.1 Supported Skill Types

| Skill | Purpose | Status |
|-------|---------|--------|
| `web_search` | Search engine queries | Framework ready, API pending |
| `skill_github` | GitHub repo / code queries | Framework ready, API pending |
| `skill_database` | Database queries | Framework ready, API pending |
| `skill_file_system` | Local file I/O | Framework ready |
| `skill_custom_api` | Custom HTTP API | Framework ready, config pending |

### 5.2 Tool Calling 流程

每个辩论 AI 调用时：

```
1. 发送 messages + tools[] 到 LLM
2. LLM 返回 content + tool_calls[]
3. 如果 tool_calls 非空：
   a. 将 assistant 消息（含 tool_calls）追加到 messages
   b. 对每个 tool_call，调用 _executeTool() 获取结果
   c. 将 tool 结果消息追加到 messages
   d. 重新调用 LLM（不再传 tools）
   e. 最多循环 3 轮
4. 返回最终 content
```

### 5.2 Tool-Calling Flow

For each debate AI invocation:

```
1. Send messages + tools[] to LLM
2. LLM returns content + tool_calls[]
3. If tool_calls is non-empty:
   a. Append the assistant message (including tool_calls) to messages
   b. For each tool_call, invoke _executeTool() to get the result
   c. Append the tool result messages to messages
   d. Re-invoke the LLM (without passing tools)
   e. Loop up to 3 rounds max
4. Return final content
```

### 5.3 工具配置

每个 AI 的配置中包含：
- `enableWebSearch: boolean`
- `skills: SkillConfig[]`（每个 skill 含 type / name / config / enabled）

### 5.3 Tool Configuration

Each AI's configuration includes:
- `enableWebSearch: boolean`
- `skills: SkillConfig[]` (each skill contains type / name / config / enabled)

---

## 六、数据流

## 6. Data Flow

### 6.1 事件总线

ReviewEngine 通过 EventEmitter 模式向外部广播 15 种事件：

```
task_created          — 任务创建
preparation_start     — 准备层开始
ai_start              — 某个 AI 开始执行
ai_complete           — 某个 AI 完成
ai_error              — 某个 AI 出错
preparation_complete  — 准备层完成
debate_round_start    — 某轮辩论开始
debate_round_complete — 某轮辩论完成
summary_start         — 总结层开始
task_complete         — 审查完成（携带最终报告）
task_error            — 审查出错
paused / resumed / stopped — 控制事件
progress              — 通用进度推送
supplement_received   — 用户补充信息
```

### 6.1 Event Bus

ReviewEngine broadcasts 15 event types externally via the EventEmitter pattern:

```
task_created          — Task created
preparation_start     — Preparation layer started
ai_start              — An AI has started executing
ai_complete           — An AI has completed
ai_error              — An AI has encountered an error
preparation_complete  — Preparation layer completed
debate_round_start    — A debate round has started
debate_round_complete — A debate round has completed
summary_start         — Summary layer started
task_complete         — Review completed (carries the final report)
task_error            — Review encountered an error
paused / resumed / stopped — Control events
progress              — General progress push
supplement_received   — User supplementary information received
```

### 6.2 状态管理

```
ReviewEngine 内部状态：
  - _currentTask: ReviewTask（审查任务元数据）
  - _outputs: RoundOutput[]（所有 AI 输出记录）
  - _finalReport: FinalReport（最终报告）
  - _progress: ReviewProgress（实时进度）
  - _isRunning / _isPaused（运行控制标志）

React 层通过 useReviewEngine() Hook 消费引擎状态，
Zustand store 提供独立 App 的持久化状态管理。
```

### 6.2 State Management

```
ReviewEngine internal state:
  - _currentTask: ReviewTask (review task metadata)
  - _outputs: RoundOutput[] (all AI output records)
  - _finalReport: FinalReport (final report)
  - _progress: ReviewProgress (real-time progress)
  - _isRunning / _isPaused (runtime control flags)

The React layer consumes engine state via the useReviewEngine() Hook.
The Zustand store provides persistent state management for the standalone App.
```

---

## 七、模型接入

## 7. Model Integration

### 7.1 支持的协议

| 协议 | 端点 | 鉴权 |
|---|---|---|
| OpenAI 兼容 | POST `/chat/completions` | `Bearer <Key>` |
| Anthropic | POST `/messages` | `x-api-key` + `anthropic-version` |
| Google Gemini | POST `/v1beta/models/{model}:generateContent` | URL param `?key=` |

国产模型（DeepSeek / 智谱 / Moonshot / 百川 / 通义千问 / 文心一言）全部走 OpenAI 兼容协议。

### 7.1 Supported Protocols

| Protocol | Endpoint | Authentication |
|----------|----------|----------------|
| OpenAI-compatible | POST `/chat/completions` | `Bearer <Key>` |
| Anthropic | POST `/messages` | `x-api-key` + `anthropic-version` |
| Google Gemini | POST `/v1beta/models/{model}:generateContent` | URL param `?key=` |

Domestic models (DeepSeek / Zhipu / Moonshot / Baichuan / Tongyi Qianwen / Wenxin Yiyan) all use the OpenAI-compatible protocol.

### 7.2 Mock 模式

- 不填 API Key 或填 `demo` → 自动走 Mock
- Mock 根据 systemPrompt 内容匹配角色，返回对应预设文本
- Mock 有 800-2800ms 随机延迟，模拟真实调用时序
- 完整流程（准备→辩论→总结）与真实调用一致

### 7.2 Mock Mode

- Leaving API Key blank or filling in `demo` → automatically falls back to Mock
- Mock matches roles based on systemPrompt content and returns corresponding preset text
- Mock includes a random delay of 800–2800ms to simulate real call timing
- The complete pipeline (preparation → debate → summary) is identical to real calls

---

## 八、关键类型定义

```typescript
interface AIConfig {
  id: number;
  roleKey: string;       // 机器可读标识
  roleName: string;      // 中文显示名
  phase: 'prep' | 'debate' | 'debate_summarizer' | 'summary';
  provider: string;      // openai / anthropic / google / deepseek / ...
  apiKey: string;        // 空 = Mock
  baseUrl: string;
  modelName: string;
  temperature: number;   // 0..2
  maxTokens: number;
  isEnabled: boolean;
  systemPrompt: string;  // 完整系统提示词，可编辑
  enableWebSearch: boolean;
  skills: SkillConfig[];
}

interface ReviewTask {
  id: number;
  title: string;
  userInput: string;
  totalRounds: number;   // 轮次判定 AI 输出
  currentRound: number;
  status: 'pending' | 'preparing' | 'debating' | 'summarizing' | 'completed' | 'error';
  createdAt: string;
  completedAt?: string;
}

interface RoundOutput {
  id: number;
  taskId: number;
  roundNumber: number;   // 0=准备 / 1..N=辩论 / 999=总结
  aiRole: string;
  roleName: string;
  outputContent: string;
  responseTimeMs: number;
  status: 'pending' | 'running' | 'completed' | 'error';
}

interface FinalReport {
  id: number;
  taskId: number;
  reportContent: string; // 结构化的「审查报告」全文
  createdAt: string;
}
```

## 8. Key Type Definitions

```typescript
interface AIConfig {
  id: number;
  roleKey: string;       // Machine-readable identifier
  roleName: string;      // Display name (Chinese)
  phase: 'prep' | 'debate' | 'debate_summarizer' | 'summary';
  provider: string;      // openai / anthropic / google / deepseek / ...
  apiKey: string;        // Empty = Mock
  baseUrl: string;
  modelName: string;
  temperature: number;   // 0..2
  maxTokens: number;
  isEnabled: boolean;
  systemPrompt: string;  // Full system prompt, editable
  enableWebSearch: boolean;
  skills: SkillConfig[];
}

interface ReviewTask {
  id: number;
  title: string;
  userInput: string;
  totalRounds: number;   // Output from Round Judge AI
  currentRound: number;
  status: 'pending' | 'preparing' | 'debating' | 'summarizing' | 'completed' | 'error';
  createdAt: string;
  completedAt?: string;
}

interface RoundOutput {
  id: number;
  taskId: number;
  roundNumber: number;   // 0=preparation / 1..N=debate / 999=summary
  aiRole: string;
  roleName: string;
  outputContent: string;
  responseTimeMs: number;
  status: 'pending' | 'running' | 'completed' | 'error';
}

interface FinalReport {
  id: number;
  taskId: number;
  reportContent: string; // Full structured review report text
  createdAt: string;
}
```

---

## 九、SDK 嵌入方式

## 9. SDK Embedding Methods

### 纯逻辑（无 UI）

```typescript
import { ReviewEngine } from './src/sdk/engine';

const engine = new ReviewEngine();
engine.on('task_complete', (e) => console.log(e.data));
await engine.runReview('标题', '用户问题...');
engine.pause(); engine.resume(); engine.stop();
engine.supplement('补充信息...');
```

### Pure Logic (No UI)

```typescript
import { ReviewEngine } from './src/sdk/engine';

const engine = new ReviewEngine();
engine.on('task_complete', (e) => console.log(e.data));
await engine.runReview('Title', 'User question...');
engine.pause(); engine.resume(); engine.stop();
engine.supplement('Supplementary information...');
```

### React 应用

```tsx
import { ReviewEngineProvider } from './src/sdk/react';
import { ReviewInput, ReviewMonitor, ReviewConfig } from './src/sdk/components';

<ReviewEngineProvider>
  <ReviewInput />
  <ReviewMonitor />
  <ReviewConfig />
</ReviewEngineProvider>
```

### React Application

```tsx
import { ReviewEngineProvider } from './src/sdk/react';
import { ReviewInput, ReviewMonitor, ReviewConfig } from './src/sdk/components';

<ReviewEngineProvider>
  <ReviewInput />
  <ReviewMonitor />
  <ReviewConfig />
</ReviewEngineProvider>
```

### 自定义网络层

```typescript
new ReviewEngine({
  llmCaller: async (req) => {
    const res = await myApi.call(req);
    return { content: res.text, responseTimeMs: res.latency };
  },
});
```

### Custom Network Layer

```typescript
new ReviewEngine({
  llmCaller: async (req) => {
    const res = await myApi.call(req);
    return { content: res.text, responseTimeMs: res.latency };
  },
});
```

---

## 十、技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 样式 | Tailwind CSS 4 + CSS 变量 |
| 状态管理 | Zustand 5（App 用）/ 引擎内置（SDK 用） |
| 路由 | React Router 7 |
| 桌面壳 | Electron 42 + @electron/packager |
| LLM 调用 | 原生 fetch()（无额外依赖） |
| 并发控制 | 自实现 Promise 串行/并行调度器 |

## 10. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 + CSS variables |
| State management | Zustand 5 (for App) / engine built-in (for SDK) |
| Routing | React Router 7 |
| Desktop shell | Electron 42 + @electron/packager |
| LLM calls | Native fetch() (no extra dependencies) |
| Concurrency control | Custom Promise serial/parallel scheduler |

---

## 十一、待完善

1. 审查结果持久化（本地 SQLite / JSON 文件）
2. 工具调用的真实后端（GitHub API、搜索引擎、数据库连接）
3. 报告导出（PDF / Markdown）
4. 审查过程回放
5. 多窗口 / Tab 支持
6. 用户配置的云端同步

## 11. To Be Improved

1. Review result persistence (local SQLite / JSON file)
2. Real backends for tool calls (GitHub API, search engine, database connections)
3. Report export (PDF / Markdown)
4. Review process replay
5. Multi-window / Tab support
6. Cloud sync for user configurations

---

**版本**：1.0.0  
**日期**：2026-06-15

**Version**: 1.0.0  
**Date**: 2026-06-15

[memory_id: memory_04_OBGIZpd1qo7B8gl8VqXq4187]