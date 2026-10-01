<div align="center">

# 你好，我是 Hank 👋

平时喜欢把想法做成能运行的小工具。最近主要在做桌面应用、LLM 接入和多 Agent 工作流，也会花不少时间处理那些不太显眼、但真正影响使用体验的细节：失败时怎么停下来、演示结果怎么标清楚、用户下一步该做什么。

</div>

---

## 我在做的项目

### [Hank Agent Team](https://github.com/Hank-create519/Hank-Agent-Team)

这是我做的一个 Electron 桌面项目，用来试验多 Agent 如何按职责接力完成一项任务。

它把工作拆成方案、信息提取、内容审核、开发产出、代码审核和交付整理等阶段，由指挥部、信息部、开发部和审核部各自负责一部分。流程引擎记录阶段状态、Agent 产出、审核打回和暂停/恢复；模型调用层则适配 OpenAI 兼容接口、Anthropic 和 Google 等服务。

技术上主要用 TypeScript、React、Electron、Vite、Tailwind CSS 和 Zustand。项目支持每个 Agent 单独配置模型，也保留了无 API Key 时的演示模式。

目前它会整理开发产出和部署说明，但不会直接把代码写进你的项目目录，也不会替你执行部署。我希望界面把真实调用、演示和降级讲清楚，而不是只给一个含糊的“成功”。

### [HankAI-Review](https://github.com/Hank-create519/HankAI-Review)

另一个正在做的桌面审查工具。我在里面试验多角色评审：有 Agent 正向提取方案，也有 Agent 专门反向找遗漏，之后由几位评审者讨论，再整理出结论。审查过程可以暂停、恢复，数据保存在本地。

它使用 Electron、React、TypeScript 和 SQL.js，关注点和 Agent Team 不太一样：更偏向把一轮审查如何形成结论记录下来。

## 我常用的技术

TypeScript · React · Electron · Vite · Tailwind CSS · Zustand · Node.js · LLM API

## 关于这些项目

这些仓库记录的是我正在做、也会继续修的东西。我更愿意把功能边界和还没完成的部分说清楚；如果你发现问题、想法不合理，或者有更好的实现方式，欢迎开 issue 跟我聊。

## 联系我

GitHub: [@Hank-create519](https://github.com/Hank-create519)
