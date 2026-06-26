import { HashRouter, Routes, Route } from 'react-router-dom';
import { ReviewEngineProvider } from './sdk/react';
import { Sidebar } from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import Home from './pages/Home';
import Config from './pages/Config';
import TaskNew from './pages/TaskNew';
import TaskMonitor from './pages/TaskMonitor';
import History from './pages/History';
import About from './pages/About';
import { useEffect } from 'react';
import { setPersistHandler } from './sdk/engine';
import { useReviewEngine } from './sdk/react';
import { useReviewStore } from './store/reviewStore';
import { loadConfigs, loadTasks, saveTask, saveOutputs, saveReport, updateConfig } from './hooks/useDB';
import { createDefaultAIConfigs, DEFAULT_CONFIGS } from './types';

function AppInit() {
  const { loadConfigs: setConfigs, setHistory, configs: storeConfigs } = useReviewStore();
  const { updateConfigs } = useReviewEngine();

  useEffect(() => {
    (async () => {
      const configs = await loadConfigs();
      if (configs.length > 0) {
        // 与 DEFAULT_CONFIGS 合并：填充新版本新增的默认字段（如 skills、systemPrompt）
        const defaultsMap = new Map(DEFAULT_CONFIGS.map(d => [d.roleKey, d]));
        let hasUpdates = false;
        const merged = configs.map((c: any) => {
          const def = defaultsMap.get(c.roleKey);
          if (!def) return c;
          let updated = { ...c };
          // 若 db 配置缺少 skills 字段或为空，从默认配置回填
          if (!c.skills || c.skills.length === 0) {
            hasUpdates = true;
            updated = { ...updated, skills: [...def.skills] };
          }
          // 若 db 配置的 systemPrompt 不包含工具使用指引（不含 web_search 关键词），
          // 说明是旧版 prompt，从默认配置回填（仅在用户未自定义 prompt 时）
          if (c.systemPrompt && !c.systemPrompt.includes('web_search') && def.systemPrompt.includes('web_search')) {
            hasUpdates = true;
            updated = { ...updated, systemPrompt: def.systemPrompt };
          }
          return updated;
        });
        setConfigs(merged);
        updateConfigs(merged);
        // 写回更新的配置到数据库
        if (hasUpdates && window.electronAPI?.db) {
          for (const c of merged) {
            await updateConfig(c.roleKey, { skills: c.skills, systemPrompt: c.systemPrompt });
          }
        }
      } else {
        // DB 无数据或不可用，用默认配置种子
        const defaults = storeConfigs.length > 0 ? storeConfigs : createDefaultAIConfigs();
        setConfigs(defaults);
        updateConfigs(defaults);
        if (window.electronAPI?.db) {
          for (const c of defaults) {
            await updateConfig(c.roleKey, c);
          }
        }
      }
      const tasks = await loadTasks();
      if (tasks.length > 0) setHistory(tasks);
    })();
  }, []);

  useEffect(() => {
    setPersistHandler((action, data) => {
      if (!window.electronAPI?.db) return;
      switch (action) {
        case 'task': saveTask(data); break;
        case 'outputs': saveOutputs(data); break;
        case 'report': saveReport(data); break;
      }
    });
  }, []);

  return null;
}

function AppLayout() {
  return (
    <div
      style={{
        height: '100%',
        background: '#F6F6F6',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle ambient glow — Mac Light */}
      <div
        style={{
          position: 'fixed',
          top: '-20%',
          left: '60%',
          width: '700px',
          height: '700px',
          background:
            'radial-gradient(ellipse at center, rgba(0,122,255,0.04) 0%, rgba(88,86,214,0.02) 40%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Sidebar />
      <main
        style={{
          height: '100%',
          marginLeft: 220,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}>
          <ThemeToggle />
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new" element={<TaskNew />} />
          <Route path="/monitor" element={<TaskMonitor />} />
          <Route path="/config" element={<Config />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ReviewEngineProvider>
        <AppInit />
        <AppLayout />
      </ReviewEngineProvider>
    </HashRouter>
  );
}
