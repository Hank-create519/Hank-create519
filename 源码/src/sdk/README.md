# 瀚海审查系统 SDK

> Hanhai Review System SDK

## 架构

```
src/sdk/
├── engine.ts      # ReviewEngine 核心 + 事件总线 + Mock 调用器
├── react.tsx      # ReviewEngineProvider + useReviewEngine Hook
├── components.tsx # ReviewInput / ReviewMonitor / ReviewConfig 可嵌入组件
├── index.ts       # 统一导出入口
├── examples.ts    # 使用示例
└── README.md      # 本文档
```

## Architecture

```
src/sdk/
├── engine.ts      # ReviewEngine core + event bus + Mock caller
├── react.tsx      # ReviewEngineProvider + useReviewEngine Hook
├── components.tsx # ReviewInput / ReviewMonitor / ReviewConfig embeddable components
├── index.ts       # Unified export entry
├── examples.ts    # Usage examples
└── README.md      # This document
```

## 核心设计

- **ReviewEngine** 是纯 TS 类，无 UI 依赖，可嵌入任何 JS/TS 环境
- 通过事件总线（`on('event', callback)`）通知外部状态变化
- `ReviewEngineProvider` 是 React 包装层，用 Context + useState 驱动组件更新
- 三个可嵌入组件（ReviewInput / ReviewMonitor / ReviewConfig）提供开箱即用的 UI

## Core Design

- **ReviewEngine** is a pure TypeScript class with no UI dependencies; it can be embedded in any JS/TS environment
- State changes are broadcast externally via an event bus (`on('event', callback)`)
- `ReviewEngineProvider` is a React wrapper layer that uses Context + useState to drive component updates
- Three embeddable components (ReviewInput / ReviewMonitor / ReviewConfig) provide out-of-the-box UI

## 快速开始

## Quick Start

### 纯逻辑（无 UI）

```ts
import { ReviewEngine } from './engine';

const engine = new ReviewEngine();
engine.on('task_complete', (e) => console.log('报告', e.data));

await engine.runReview('标题', '问题描述...');
```

### Pure Logic (No UI)

```ts
import { ReviewEngine } from './engine';

const engine = new ReviewEngine();
engine.on('task_complete', (e) => console.log('Report', e.data));

await engine.runReview('Title', 'Problem description...');
```

### React 应用

```tsx
import { ReviewEngineProvider, useReviewEngine } from './react';
import { ReviewInput, ReviewMonitor, ReviewConfig } from './components';

function App() {
  return (
    <ReviewEngineProvider>
      <ReviewInput />
      <ReviewMonitor />
    </ReviewEngineProvider>
  );
}
```

### React Application

```tsx
import { ReviewEngineProvider, useReviewEngine } from './react';
import { ReviewInput, ReviewMonitor, ReviewConfig } from './components';

function App() {
  return (
    <ReviewEngineProvider>
      <ReviewInput />
      <ReviewMonitor />
    </ReviewEngineProvider>
  );
}
```

## 自定义网络层

```ts
const engine = new ReviewEngine({
  llmCaller: async (req) => {
    // 接入你自己的 API 网关
    const res = await myApi.call(req);
    return { content: res.text, responseTimeMs: res.latency };
  },
});
```

## Custom Network Layer

```ts
const engine = new ReviewEngine({
  llmCaller: async (req) => {
    // Connect to your own API gateway
    const res = await myApi.call(req);
    return { content: res.text, responseTimeMs: res.latency };
  },
});
```

[memory_id: memory_03_z5BC6SPo0wu6gLZT4ROZ9526]