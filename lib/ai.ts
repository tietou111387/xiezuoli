// AI 客户端 — 统一接口，默认 Claude API
// 支持切换 OpenAI / 本地 Ollama

import { Article } from "./types";

interface AIConfig {
  provider: "claude" | "openai" | "ollama";
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

// 从环境变量读配置
function getConfig(): AIConfig {
  return {
    provider: (process.env.AI_PROVIDER as AIConfig["provider"]) || "claude",
    apiKey: process.env.AI_API_KEY || "",
    baseUrl: process.env.AI_BASE_URL,
    model: process.env.AI_MODEL,
  };
}

async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const config = getConfig();

  if (config.provider === "ollama") {
    return callOllama(config, prompt, systemPrompt);
  }

  // Claude / OpenAI 共用 OpenAI 兼容接口
  return callOpenAICompat(config, prompt, systemPrompt);
}

async function callOpenAICompat(
  config: AIConfig,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const url =
    config.provider === "claude"
      ? "https://api.anthropic.com/v1/messages"
      : (config.baseUrl ? `${config.baseUrl}/chat/completions` : "https://api.openai.com/v1/chat/completions");

  const isClaude = config.provider === "claude";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let body: any;

  if (isClaude) {
    headers["x-api-key"] = config.apiKey;
    headers["anthropic-version"] = "2023-06-01";
    body = {
      model: config.model || "claude-sonnet-4-20250514",
      // ponytail: 14 维度深度拆解的 JSON 常超 4K tokens,
      // 截断会产生 Expected property name 且 repair 救不回。
      max_tokens: 16000,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    };
  } else {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
    const messages: any[] = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });
    body = {
      model: config.model || "gpt-4o",
      messages,
      temperature: 0.3,
      // ponytail: DeepSeek/OpenAI 默认 max_tokens=4096 会截断 14 维度拆解 JSON。
      // deepseek-chat 上限 8192;gpt-4o 更高。取 8000 兼容两者。
      max_tokens: 8000,
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error (${res.status}): ${err}`);
  }

  const data = await res.json();

  if (isClaude) {
    return data.content?.[0]?.text || "";
  } else {
    return data.choices?.[0]?.message?.content || "";
  }
}

async function callOllama(
  config: AIConfig,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const url = config.baseUrl || "http://localhost:11434/api/generate";

  const body: any = {
    model: config.model || "llama3.1",
    prompt,
    stream: false,
  };
  if (systemPrompt) body.system = systemPrompt;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Ollama error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.response || "";
}

// ============================================================
// 拆解文章 — 14维度深度拆解
// ponytail: 短 system prompt,让模型量力而行不硬撑;
// JSON 截断由 json-extract 兜底修复。
// ============================================================
const ANALYSIS_SYSTEM_PROMPT = `你是官媒文章拆解专家，也是申论/行测导师。对文章做14维度拆解，直接输出纯JSON（不要代码块，不要前后说明）。字符串内引用必须用「」不用英文双引号。

{
  "logicalFramework": {
    "thesis": "中心论点",
    "subTheses": [{ "point": "分论点", "evidence": ["论据"], "analysis": "分析" }],
    "conclusion": "结论",
    "structure": "intro-body-conclusion|problem-analysis-solution|phenomenon-cause-measure|progressive|contrast|parallel",
    "outline": ["段1大意"]
  },
  "argumentation": {
    "methods": ["example|reasoning|contrast|analogy|citation|induction|deduction|refutation"],
    "highlights": ["亮点"],
    "dataUsage": ["数据运用"]
  },
  "rhetoric": {
    "devices": [{ "type": "parallelism|metaphor|antithesis|repetition|rhetorical|climax|quote|contrast", "example": "原文", "explanation": "效果" }],
    "paragraphAnalysis": [{ "paragraphIndex": 1, "function": "引入|过渡|论证|总结", "techniques": ["技巧"], "learnable": "可学点" }]
  },
  "goldenSentences": [{ "text": "金句", "category": "opening|transition|argument|closing|quote", "usage": "场景", "imitation": "仿写" }],
  "vocabulary": [{ "word": "词语", "pinyin": "拼音", "meaning": "含义", "category": "verb|noun|adj|phrase|chengyu", "context": "语境", "level": "basic|intermediate|advanced", "alternatives": ["近义"], "usageExample": "造句" }],
  "xingceLinks": [{ "category": "verbal|judgment|common_sense", "questionType": "题型", "relevance": "关联", "originalText": "原文", "testPoint": "考点", "sampleQuestion": "示例题", "skillTip": "技巧" }],
  "mindMap": { "id": "root", "label": "标题", "children": [{ "id": "1", "label": "要点", "children": [] }] },
  "writingPrompts": [{ "topic": "economy|livelihood|ecology|culture|governance|politics|law|education|tech|agriculture", "title": "题目", "difficulty": "easy|medium|hard", "requirements": ["要求"] }],
  "policyTracing": {
    "relatedPolicies": [{ "title": "文件全称", "issuingBody": "发文机关", "publishDate": "YYYY-MM", "relevance": "关联", "keyPoint": "要点" }],
    "policyEvolution": "演变",
    "implementationPath": "落地",
    "keyDocuments": ["文件"]
  },
  "historicalContext": {
    "timeline": [{ "year": "年份", "event": "事件", "significance": "意义" }],
    "evolutionSummary": "总结",
    "currentStage": "当前阶段",
    "futureTrend": "趋势"
  },
  "comparativeAnalysis": {
    "perspectives": [{ "viewpoint": "观点", "supporter": "持方", "reasoning": "依据", "evaluation": "评价" }],
    "mediaStances": [{ "mediaName": "媒体", "stance": "立场", "angle": "角度", "difference": "差异" }],
    "regionalDifferences": "地域差异",
    "consensusAndDispute": "共识与分歧"
  },
  "writingTransfer": {
    "templates": [{ "name": "模板名", "structure": "[骨架]", "placeholders": ["槽位"], "example": "示例", "applicableScenarios": ["场景"] }],
    "techniques": [{ "technique": "技法", "principle": "原理", "migration": "迁移", "example": "示例" }],
    "commonPatterns": ["规律"],
    "adaptationGuide": "指南"
  },
  "mentalModels": [{ "name": "思维模型", "application": "应用", "explanation": "说明", "transferable": "迁移场景", "relatedConcepts": ["关联概念"] }],
  "shenlunLinks": [{ "year": "年份", "region": "国考|省考+省份", "topic": "主题", "relevance": "关联", "questionType": "summary|analysis|countermeasure|essay|application", "answerInspiration": "启示", "difficulty": "easy|medium|hard" }]
}`;

export async function analyzeArticle(article: Article): Promise<string> {
  const prompt = `
拆解以下官媒文章，输出完整的14维度JSON。所有字段都要有内容，不敷衍。

标题：${article.title}
来源：${article.sourceName}
日期：${article.publishDate}

正文：
${article.content.slice(0, 12000)}`;

  return callAI(prompt, ANALYSIS_SYSTEM_PROMPT);
}

// ============================================================
// 批改仿写
// ============================================================
const FEEDBACK_SYSTEM_PROMPT = `你是一位严格的申论/公文写作批改老师。

批改维度：
1. 逻辑性（25分）：论点是否明确、论证是否严密、逻辑链是否完整
2. 语言表达（25分）：是否规范、简洁、准确，是否符合公文语体
3. 结构完整（20分）：是否遵循"总-分-总"或其他规范结构
4. 内容深度（20分）：分析是否到位、对策是否可行
5. 论证力度（10分）：论据是否充分、说理是否有说服力

输出格式：
\`\`\`json
{
  "overallScore": 85,
  "dimensionScores": [
    { "dimension": "logic", "score": 22, "comment": "..." },
    { "dimension": "language", "score": 21, "comment": "..." },
    { "dimension": "structure", "score": 18, "comment": "..." },
    { "dimension": "content", "score": 17, "comment": "..." },
    { "dimension": "argument", "score": 7, "comment": "..." }
  ],
  "strengths": ["..."],
  "weaknesses": ["..."],
  "corrections": [
    {
      "original": "原文句式",
      "suggestion": "建议改为",
      "reason": "修改原因",
      "position": "位置描述"
    }
  ],
  "modelAnswer": "参考范文全文",
  "improvedVersion": "在原文基础上润色后的版本"
}
\`\`\`
`;

export async function evaluateWriting(
  promptTitle: string,
  topic: string,
  userContent: string,
  requirements?: string[]
): Promise<string> {
  const reqs = requirements?.length ? `\n写作要求：\n${requirements.join("\n")}` : "";

  const prompt = `
仿写题目：${promptTitle}
话题：${topic}${reqs}

学生写的文章：
${userContent}

请严格按评分标准批改，输出JSON。`;

  return callAI(prompt, FEEDBACK_SYSTEM_PROMPT);
}
