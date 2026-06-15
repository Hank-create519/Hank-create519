// ============================================================
// LLM API 调用封装 —— 支持 OpenAI / Anthropic / Google / 国产兼容
// ============================================================

import type { LLMRequest, LLMResponse } from '../types';

/**
 * 多协议 LLM 调用器
 * - OpenAI 兼容（含国产模型）: POST /chat/completions + Bearer
 * - Anthropic: POST /messages + x-api-key + anthropic-version
 * - Google: POST /v1beta/models/...:generateContent
 */
export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
  const start = Date.now();
  const provider = req.provider || 'openai';

  try {
    if (provider === 'anthropic') {
      return await callAnthropic(req, start);
    }
    if (provider === 'google') {
      return await callGoogle(req, start);
    }
    // 默认走 OpenAI 兼容协议（含所有国产模型 + custom）
    return await callOpenAICompat(req, start);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { content: '', responseTimeMs: Date.now() - start, error: msg };
  }
}

async function callOpenAICompat(req: LLMRequest, start: number): Promise<LLMResponse> {
  const baseUrl = req.baseUrl.replace(/\/+$/, '');
  const url = `${baseUrl}/chat/completions`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${req.apiKey}`,
    },
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      temperature: req.temperature ?? 0.3,
      max_tokens: req.maxTokens ?? 4096,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { content: '', responseTimeMs: Date.now() - start, error: `HTTP ${res.status}: ${body}` };
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || '';
  return { content, responseTimeMs: Date.now() - start };
}

async function callAnthropic(req: LLMRequest, start: number): Promise<LLMResponse> {
  const baseUrl = req.baseUrl.replace(/\/+$/, '');
  const url = `${baseUrl}/messages`;

  // 拆分 system 和 messages
  const systemMsg = req.messages.find((m) => m.role === 'system');
  const chatMsgs = req.messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));

  const body: Record<string, unknown> = {
    model: req.model,
    messages: chatMsgs,
    max_tokens: req.maxTokens ?? 4096,
    temperature: req.temperature ?? 0.3,
  };
  if (systemMsg && typeof systemMsg.content === 'string') {
    body.system = [{ type: 'text', text: systemMsg.content }];
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': req.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return { content: '', responseTimeMs: Date.now() - start, error: `HTTP ${res.status}: ${text}` };
  }

  const json = await res.json();
  const content = json.content?.[0]?.text || '';
  return { content, responseTimeMs: Date.now() - start };
}

async function callGoogle(req: LLMRequest, start: number): Promise<LLMResponse> {
  const baseUrl = req.baseUrl.replace(/\/+$/, '');
  const url = `${baseUrl}/v1beta/models/${req.model}:generateContent?key=${req.apiKey}`;

  // 把 messages 转成 Google 格式
  const contents = req.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: req.temperature ?? 0.3,
        maxOutputTokens: req.maxTokens ?? 4096,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { content: '', responseTimeMs: Date.now() - start, error: `HTTP ${res.status}: ${text}` };
  }

  const json = await res.json();
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { content, responseTimeMs: Date.now() - start };
}
