// Hank个人工作室 AI审查系统 · 工具注册表 v1.0
// 定义所有可用工具及其 JSON Schema、risk 等级、executor

// ============ 工具定义 ============

export interface ToolDef {
  name: string;
  description: string;
  parameters: Record<string, any>; // JSON Schema for OpenAI function calling
  risk: 'low' | 'medium' | 'high';
  executor: (args: Record<string, string>) => Promise<string>;
}

/** 所有可用工具的注册表 */
export const TOOL_REGISTRY: ToolDef[] = [
  {
    name: 'web_search',
    description: '搜索互联网获取最新信息。当需要查找当前事件、最新数据、或知识库之外的信息时使用。',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词或问题',
        },
      },
      required: ['query'],
    },
    risk: 'low',
    executor: async (args) => {
      const query = args.query || '';
      if (!query.trim()) return '搜索关键词不能为空。';

      const q = encodeURIComponent(query);
      const USER_AGENT =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

      // ========== 后端 1: Bing 搜索（HTML 抓取） ==========
      const tryBing = async (): Promise<string> => {
        const res = await fetch(`https://www.bing.com/search?q=${q}&setlang=zh-cn`, {
          headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'zh-CN,zh;q=0.9' },
          signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();

        // 解析 Bing 搜索结果块：<li class="b_algo"> ... <h2><a>标题</a></h2> ... <p>摘要</p> ... </li>
        const blocks = html.match(/<li[^>]*class="b_algo"[^>]*>[\s\S]*?<\/li>/gi) || [];
        const results: string[] = [];

        for (const block of blocks) {
          if (results.length >= 8) break;
          // 提取标题
          const titleMatch = block.match(/<h2[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
          const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

          // 提取摘要
          let snippet = '';
          const snipMatch = block.match(/<p[^>]*class="[^"]*b_lineclamp[^"]*"[^>]*>([\s\S]*?)<\/p>/i)
            || block.match(/<p[^>]*>([\s\S]{20,300}?)<\/p>/i);
          if (snipMatch) {
            snippet = snipMatch[1].replace(/<[^>]+>/g, '').replace(/&ensp;/g, ' ').replace(/&#0?\d+;/g, ' ').trim();
          }

          const entry = [title, snippet].filter(Boolean).join('\n   ');
          if (entry.length > 10) results.push(entry);
        }

        if (results.length === 0) throw new Error('未提取到搜索结果');
        return results.map((r, i) => `${i + 1}. ${r}`).join('\n\n');
      };

      // ========== 后端 2: DuckDuckGo HTML（兜底） ==========
      const tryDuckDuckGo = async (): Promise<string> => {
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
          headers: { 'User-Agent': 'HankAI-Review/1.0' },
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        const snippets: string[] = [];
        const snippetRe = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
        let m: RegExpExecArray | null;
        while ((m = snippetRe.exec(html)) !== null && snippets.length < 10) {
          const text = m[1].replace(/<[^>]+>/g, '').trim();
          if (text) snippets.push(text);
        }
        if (snippets.length === 0) throw new Error('未找到相关搜索结果');
        return snippets.map((s, i) => `${i + 1}. ${s}`).join('\n\n');
      };

      // ========== 执行：Bing 优先，DuckDuckGo 兜底 ==========
      try {
        return await tryBing();
      } catch (bingErr: any) {
        try {
          return await tryDuckDuckGo();
        } catch (ddgErr: any) {
          return `搜索执行失败: Bing(${bingErr.message}), DuckDuckGo(${ddgErr.message})`;
        }
      }
    },
  },
  {
    name: 'web_fetch',
    description: '抓取指定网页的正文内容。当需要读取具体网页文章内容时使用。',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: '要抓取的网页完整 URL（必须以 https:// 开头）',
        },
      },
      required: ['url'],
    },
    risk: 'medium',
    executor: async (args) => {
      const url = args.url || '';
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'HankAI-Review/1.0' },
          signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) return `网页抓取失败: HTTP ${res.status}`;
        const html = await res.text();
        // 简单提取正文：去除 script/style 标签后取纯文本
        let text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        // 截断到 4000 字符（safetyGuard 会再次清洗）
        if (text.length > 4000) text = text.slice(0, 4000) + '...';
        return text || '网页内容为空。';
      } catch (err: any) {
        return `网页抓取失败: ${err.message}`;
      }
    },
  },
  {
    name: 'read_file',
    description: '读取本地文件内容。仅限工作目录范围内的文件。',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '要读取的文件路径（必须在工作目录范围内）',
        },
      },
      required: ['path'],
    },
    risk: 'medium',
    executor: async (_args) => {
      // read_file 的 executor 在 safetyGuard 中经过路径校验后才进入
      // 这里做占位：实际读取由 engine 中的安全包装层完成
      return '[read_file executor - 由安全层路由拦截]';
    },
  },
  {
    name: 'python_exec',
    description: '在沙箱中执行 Python 代码并返回结果。代码受安全限制。',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: '要执行的 Python 代码（受安全限制，禁用 os/subprocess/eval/exec 等）',
        },
      },
      required: ['code'],
    },
    risk: 'high',
    executor: async (_args) => {
      // python_exec 的 executor 在 safetyGuard 中经过安全校验后才进入
      return '[python_exec executor - 由安全层路由拦截]';
    },
  },
];

// ============ 工具查找辅助 ============

export function getToolByName(name: string): ToolDef | undefined {
  return TOOL_REGISTRY.find(t => t.name === name);
}

// ============ OpenAI 工具格式转换 ============

export function toOpenAITools(tools: ToolDef[]): Record<string, any>[] {
  return tools.map(t => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}
