// ============================================================
// 瀚海审查系统 SDK · 使用示例
// ============================================================

// 示例 1：纯逻辑嵌入
// import { ReviewEngine } from './engine';
// const engine = new ReviewEngine();
// engine.on('task_complete', (e) => console.log('报告', e.data));
// await engine.runReview('标题', '问题描述');

// 示例 2：React 应用
// import { ReviewEngineProvider } from './react';
// import { ReviewInput, ReviewMonitor } from './components';
// <ReviewEngineProvider>
//   <ReviewInput />
//   <ReviewMonitor />
// </ReviewEngineProvider>

// 示例 3：自定义网络层
// const engine = new ReviewEngine({
//   llmCaller: async (req) => {
//     const res = await myApi.call(req);
//     return { content: res.text, responseTimeMs: res.latency };
//   },
// });

// 示例 4: 自定义 8 个角色配置
// const engine = new ReviewEngine({
//   configs: [
//     { roleKey: 'extractor', provider: 'deepseek', apiKey: 'sk-xxx', modelName: 'deepseek-chat' },
//     { roleKey: 'ai_1_logic', provider: 'openai', apiKey: 'sk-xxx', modelName: 'o1-mini' },
//   ],
// });

export {};
