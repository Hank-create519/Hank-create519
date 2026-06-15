# 瀚海AI审查系统 1.0 · 项目交付

> Hanhai AI Review System 1.0 — Project Delivery

## 项目概况

**名称**：瀚海AI审查系统 1.0  
**路径**：`/Users/niefeilun/lobsterai/project/hanhai-agents`  
**桌面 App**：`~/Desktop/瀚海AI审查系统.app`（289MB，双击运行）  
**版本**：1.0.0  
**构建日期**：2026-06-11  
**技术栈**：React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Electron 42  

## Project Overview

**Name**: Hanhai AI Review System 1.0  
**Path**: `/Users/niefeilun/lobsterai/project/hanhai-agents`  
**Desktop App**: `~/Desktop/瀚海AI审查系统.app` (289MB, double-click to run)  
**Version**: 1.0.0  
**Build Date**: 2026-06-11  
**Tech Stack**: React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Electron 42  

---

## 一句话定位

不是「一个 AI 回答你」，而是「一个 AI 审查委员会」——8 个异构 AI 角色分层协作，多轮交叉辩论，最终输出一份含共识/分歧/风险/未验证假设的结构化报告。

## One-Line Positioning

Not "an AI that answers you," but "an AI review committee" — 8 heterogeneous AI roles collaborating in layers, engaging in multi-round cross-debate, ultimately producing a structured report containing consensus, disagreements, risks, and unverified assumptions.

---

## 核心架构

## Core Architecture

### 三层审查流程

### Three-Layer Review Pipeline

```
用户输入
  │
  ▼
【准备层】串行
  信息提取 AI → 信息整合 AI → 轮次判定 AI（定 N 轮）
  │
  ▼
【辩论层】N 轮循环，轮内并行，轮间串行
  第 1 轮：N 个辩论 AI 并行「生成」→ 阶段汇总 AI 压缩
  第 2+ 轮：N 个 AI 并行「审查上轮输出」→ 阶段汇总 AI 压缩
  上下文：taskBrief + 摘要链 + 上轮所有其他 AI 的原始输出
  │
  ▼
【总结层】串行
  最终总结 AI → 结构化审查报告（含完整摘要链上下文）
```

```
User Input
  │
  ▼
[Preparation Layer] Serial
  Info Extraction AI → Info Integration AI → Round Judge AI (determines N rounds)
  │
  ▼
[Debate Layer] N-round loop, parallel within rounds, serial between rounds
  Round 1: N Debate AIs in parallel "generate" → Stage Summary AI compresses
  Round 2+: N AIs in parallel "critique previous round output" → Stage Summary AI compresses
  Context: taskBrief + summary chain + all other AIs' raw output from previous round
  │
  ▼
[Summary Layer] Serial
  Final Summary AI → Structured review report (with full summary chain context)
```

### 数据流关键设计

- **交叉审查**：第 2+ 轮每个 AI 的 prompt 包含上一轮所有其他 AI 的原始输出（截断 3000 字），要求找出逻辑漏洞/事实错误
- **摘要链**：AI-5 拿到所有轮次的阶段汇总（不是仅最后一轮），保证不丢失辩论脉络
- **动态 N 辩论 AI**：从配置中读取所有 `phase==='debate'` 的 AI，不硬编码数量

### Key Data Flow Design Decisions

- **Cross-review**: Starting from round 2, each AI's prompt includes the raw output of all other AIs from the previous round (truncated at 3000 characters), tasked with identifying logical flaws / factual errors
- **Summary chain**: The final summary AI receives stage summaries from all rounds (not just the last one), ensuring the debate thread is never lost
- **Dynamic N debate AIs**: All AIs with `phase==='debate'` are read from configuration; the count is never hardcoded

---

## 关键文件

| 文件 | 作用 |
|---|---|
| `src/types/index.ts` | 所有类型定义 + 8 角色默认提示词 + 默认配置 |
| `src/sdk/engine.ts` | **核心引擎**：ReviewEngine 类，事件总线，三层流程，工具调用框架，Mock 模式 |
| `src/sdk/react.tsx` | React 封装：ReviewEngineProvider + useReviewEngine Hook |
| `src/sdk/components.tsx` | 可嵌入组件：ReviewInput / ReviewMonitor / ReviewConfig |
| `src/sdk/index.ts` | SDK 统一导出入口 |
| `src/utils/llmApi.ts` | **真实 API 调用**：OpenAI/Anthropic/Google/国产兼容协议 |
| `src/utils/scheduler.ts` | 串行/并行调度工具 |
| `src/store/reviewStore.ts` | Zustand 状态管理（独立 App 用） |
| `src/components/Sidebar.tsx` | 左侧导航栏 |
| `src/pages/*.tsx` | 5 个页面：Home / TaskNew / TaskMonitor / Config / History |
| `electron-main.cjs` | Electron 主进程 |
| `vite.config.ts` | Vite 构建配置 |

## Key Files

| File | Role |
|------|------|
| `src/types/index.ts` | All type definitions + 8 role default prompts + default configuration |
| `src/sdk/engine.ts` | **Core engine**: ReviewEngine class, event bus, three-layer pipeline, tool-calling framework, Mock mode |
| `src/sdk/react.tsx` | React wrapper: ReviewEngineProvider + useReviewEngine Hook |
| `src/sdk/components.tsx` | Embeddable components: ReviewInput / ReviewMonitor / ReviewConfig |
| `src/sdk/index.ts` | SDK unified export entry |
| `src/utils/llmApi.ts` | **Real API calls**: OpenAI / Anthropic / Google / domestic compatible protocols |
| `src/utils/scheduler.ts` | Serial / parallel scheduling utility |
| `src/store/reviewStore.ts` | Zustand state management (for standalone App) |
| `src/components/Sidebar.tsx` | Left sidebar navigation |
| `src/pages/*.tsx` | 5 pages: Home / TaskNew / TaskMonitor / Config / History |
| `electron-main.cjs` | Electron main process |
| `vite.config.ts` | Vite build configuration |

---

## 使用方式

## Usage

### Mac 桌面 App
双击 `~/Desktop/瀚海AI审查系统.app`

### Mac Desktop App
Double-click `~/Desktop/瀚海AI审查系统.app`

### 开发模式
```bash
cd /Users/niefeilun/lobsterai/project/hanhai-agents
npm run dev          # 浏览器访问 http://localhost:5173
npm run electron:dev # Electron 开发窗口
```

### Development Mode
```bash
cd /Users/niefeilun/lobsterai/project/hanhai-agents
npm run dev          # Browser access at http://localhost:5173
npm run electron:dev # Electron dev window
```

### 重新打包 .app
```bash
cd /Users/niefeilun/lobsterai/project/hanhai-agents
npm run build
ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" npx @electron/packager . "瀚海AI审查系统" --platform=darwin --arch=arm64 --out=./release --overwrite
cp -R release/瀚海AI审查系统-darwin-arm64/瀚海AI审查系统.app ~/Desktop/
xattr -cr ~/Desktop/瀚海AI审查系统.app
```

### Repackage .app
```bash
cd /Users/niefeilun/lobsterai/project/hanhai-agents
npm run build
ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" npx @electron/packager . "瀚海AI审查系统" --platform=darwin --arch=arm64 --out=./release --overwrite
cp -R release/瀚海AI审查系统-darwin-arm64/瀚海AI审查系统.app ~/Desktop/
xattr -cr ~/Desktop/瀚海AI审查系统.app
```

---

## 真实 API 接入

在 AI 配置页为每个角色填入真实 API Key（不要填 `demo`，不要留空），即可走真实 LLM 调用。

**支持的模型提供商**：OpenAI / Anthropic (Claude) / Google Gemini / DeepSeek / 智谱 / Moonshot / 百川 / 通义千问 / 文心一言 / 自定义兼容 OpenAI 协议的网关

## Real API Integration

Fill in a real API Key for each role on the AI configuration page (do not use `demo`, do not leave blank) to enable real LLM calls.

**Supported model providers**: OpenAI / Anthropic (Claude) / Google Gemini / DeepSeek / Zhipu / Moonshot / Baichuan / Tongyi Qianwen / Wenxin Yiyan / custom gateways compatible with the OpenAI protocol

**接入逻辑**（`src/utils/llmApi.ts`）：
- OpenAI 兼容：POST `/chat/completions` + `Bearer <Key>`
- Anthropic：POST `/messages` + `x-api-key` + `anthropic-version: 2023-06-01`
- Google：POST `/v1beta/models/{model}:generateContent?key={Key}`

**Integration logic** (`src/utils/llmApi.ts`):
- OpenAI-compatible: POST `/chat/completions` + `Bearer <Key>`
- Anthropic: POST `/messages` + `x-api-key` + `anthropic-version: 2023-06-01`
- Google: POST `/v1beta/models/{model}:generateContent?key={Key}`

**工具调用**：框架已就绪（`_executeTool` 在 engine.ts），支持 web_search / github / database / file_system / custom_api。当前返回占位符，接入真实 API 即可工作。

**Tool calling**: The framework is ready (`_executeTool` in engine.ts), supporting web_search / github / database / file_system / custom_api. Currently returns placeholders; will work once real APIs are connected.

---

## 已知限制

1. Mock 模式下每个 AI 的响应是固定的预设文本，不随输入变化
2. 工具调用当前无真实后端（框架就绪，需接入 API）
3. 单窗口应用，无多窗口支持
4. 审查结果仅内存存储，关闭后丢失（未持久化到磁盘）

## Known Limitations

1. In Mock mode, each AI's response is a fixed preset text that does not vary with input
2. Tool calls currently lack a real backend (framework ready, APIs need to be connected)
3. Single-window application; no multi-window support
4. Review results are stored only in memory and lost on close (not persisted to disk)

---

## npm 脚本

| 命令 | 作用 |
|---|---|
| `npm run dev` | Vite 开发服务器 |
| `npm run build` | TypeScript 类型检查 + 生产构建 |
| `npm run electron:dev` | Electron 开发模式 |
| `npm run electron:build` | 打包 .app（需先 build） |

## npm Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | TypeScript type check + production build |
| `npm run electron:dev` | Electron dev mode |
| `npm run electron:build` | Package .app (requires prior build) |

---

## 项目版本历史

- v0.1：初始 React + Vite 脚手架
- v0.3：8 AI 角色 + 基本审查流程 + Mock 模式
- v0.5：动态 N 辩论 AI + 交叉审查 + 摘要链 + 工具调用框架
- v0.7：配置页增删 AI + 阶段汇总归类到辩论层 + 色彩收敛
- v1.0：Electron .app 打包 + 标题栏修复 + 液态玻璃审美

## Project Version History

- v0.1: Initial React + Vite scaffold
- v0.3: 8 AI roles + basic review pipeline + Mock mode
- v0.5: Dynamic N debate AIs + cross-review + summary chain + tool-calling framework
- v0.7: Config page add/remove AI + stage summary categorized under debate layer + color convergence
- v1.0: Electron .app packaging + title bar fix + liquid glass aesthetic

---

**交付人**：AI 助手 Hank  
**接收人**：聂瀚杰  
**日期**：2026-06-13

**Delivered by**: AI Assistant Hank  
**Received by**: Nie Hanjie  
**Date**: 2026-06-13

[memory_id: memory_02_uj9S10tu4UcuMa2cODVp3292]