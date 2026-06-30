// ============================================================
// 写作能力提升工具 — 核心类型定义
// ============================================================

// ---- 官媒来源 ----
export type MediaType = "national" | "provincial" | "municipal";

export interface MediaSource {
  id: string;
  name: string;           // 人民日报、新华社等
  type: MediaType;
  province?: string;       // 省份，省级/地市级时有值
  city?: string;           // 地市
  url: string;
  rssUrl?: string;
  crawlerType: "rss" | "html" | "api";
}

// ---- 文章 ----
export interface Article {
  id: string;
  title: string;
  author?: string;
  sourceId: string;
  sourceName: string;
  publishDate: string;
  url: string;
  content: string;         // 原始全文
  summary?: string;        // AI生成摘要
  topic: Topic;            // 话题分类
  province?: string;
  city?: string;
  wordCount: number;
  tags: string[];
  isProcessed: boolean;    // 是否已AI拆解
  createdAt: string;
  updatedAt: string;
}

// ---- 话题分类 ----
export type Topic =
  | "economy"       // 经济
  | "livelihood"    // 民生
  | "ecology"       // 生态
  | "culture"       // 文化
  | "governance"    // 治理
  | "politics"      // 政治
  | "law"           // 法治
  | "education"     // 教育
  | "tech"          // 科技
  | "agriculture";  // 三农

export const TOPIC_LABELS: Record<Topic, string> = {
  economy: "经济",
  livelihood: "民生",
  ecology: "生态",
  culture: "文化",
  governance: "治理",
  politics: "政治",
  law: "法治",
  education: "教育",
  tech: "科技",
  agriculture: "三农",
};

// ---- AI 拆解结果（12维扩展版）----
export interface ArticleAnalysis {
  id: string;
  articleId: string;
  createdAt: string;

  // 1. 逻辑框架
  logicalFramework: LogicalFramework;

  // 2. 论证手法分析
  argumentation: ArgumentationAnalysis;

  // 3. 修辞分析
  rhetoric: RhetoricAnalysis;

  // 4. 金句摘录
  goldenSentences: GoldenSentence[];

  // 5. 词汇积累
  vocabulary: VocabularyItem[];

  // 6. 行测联动
  xingceLinks: XingceLink[];

  // 7. 思维导图（JSON结构）
  mindMap: MindMapNode;

  // 8. 仿写提示
  writingPrompts: WritingPrompt[];

  // ===== 以下为扩展维度（v2 新增）=====

  // 9. 政策溯源 — 关联国家/部委政策文件
  policyTracing?: PolicyTracing;

  // 10. 历史脉络 — 同类议题的历史演变
  historicalContext?: HistoricalContext;

  // 11. 同类对比 — 横向对比同类文章/不同媒体立场
  comparativeAnalysis?: ComparativeAnalysis;

  // 12. 写作迁移 — 提炼可复用的写作模型
  writingTransfer?: WritingTransfer;

  // 13. 思维模型 — 提炼文章背后的思维框架
  mentalModels?: MentalModel[];

  // 14. 申论真题联动 — 关联历年申论真题
  shenlunLinks?: ShenlunLink[];
}

export interface LogicalFramework {
  thesis: string;           // 中心论点
  subTheses: SubThesis[];  // 分论点
  conclusion: string;       // 结论
  structure: StructureType; // 文章结构类型
  outline: string[];        // 段落大纲
}

export interface SubThesis {
  point: string;
  evidence: string[];      // 论据
  analysis: string;        // 说理分析
}

export type StructureType =
  | "introduction-body-conclusion" // 总分总
  | "problem-analysis-solution" // 问题-分析-对策
  | "phenomenon-cause-measure" // 现象-原因-措施
  | "progressive" // 递进式
  | "contrast" // 对比式
  | "parallel"; // 并列式

export const STRUCTURE_LABELS: Record<StructureType, string> = {
  "introduction-body-conclusion": "总分总",
  "problem-analysis-solution": "问题-分析-对策",
  "phenomenon-cause-measure": "现象-原因-措施",
  progressive: "递进式",
  contrast: "对比式",
  parallel: "并列式",
};

export interface ArgumentationAnalysis {
  methods: ArgumentationMethod[];
  highlights: string[];     // 论证亮点
  dataUsage: string[];      // 数据运用分析
}

export type ArgumentationMethod =
  | "example"        // 举例论证
  | "reasoning"      // 道理论证
  | "contrast"       // 对比论证
  | "analogy"        // 比喻论证
  | "citation"       // 引用论证
  | "induction"      // 归纳论证
  | "deduction"      // 演绎论证
  | "refutation";    // 驳论

export const ARGUMENTATION_LABELS: Record<ArgumentationMethod, string> = {
  example: "举例论证",
  reasoning: "道理论证",
  contrast: "对比论证",
  analogy: "比喻论证",
  citation: "引用论证",
  induction: "归纳论证",
  deduction: "演绎论证",
  refutation: "驳论",
};

export interface RhetoricAnalysis {
  devices: RhetoricDevice[];
  paragraphAnalysis: ParagraphRhetoric[];
}

export interface RhetoricDevice {
  type: RhetoricType;
  example: string;       // 原文例句
  explanation: string;   // 效果分析
  position: string;      // 位置标注（段落号）
}

export type RhetoricType =
  | "parallelism"   // 排比
  | "metaphor"      // 比喻
  | "antithesis"    // 对偶
  | "repetition"    // 反复
  | "rhetorical"    // 反问/设问
  | "climax"        // 层递
  | "quote"         // 引用
  | "contrast";     // 对比

export const RHETORIC_LABELS: Record<RhetoricType, string> = {
  parallelism: "排比",
  metaphor: "比喻",
  antithesis: "对偶",
  repetition: "反复",
  rhetorical: "反问/设问",
  climax: "层递",
  quote: "引用",
  contrast: "对比",
};

export interface ParagraphRhetoric {
  paragraphIndex: number;
  function: string;      // 段落功能（引入/过渡/论证/总结）
  techniques: string[];  // 使用的技巧
  learnable: string;     // 可学之处
}

export interface GoldenSentence {
  text: string;
  category: "opening" | "transition" | "argument" | "closing" | "quote";
  usage: string;         // 适用场景
  imitation: string;     // 仿写示例
}

export interface VocabularyItem {
  word: string;
  pinyin?: string;
  meaning: string;       // 含义
  category: "verb" | "noun" | "adj" | "phrase" | "chengyu";
  context: string;       // 原文语境
  level: "basic" | "intermediate" | "advanced";
  alternatives: string[]; // 近义词
  usageExample: string;  // 造句示例
}

// ---- 行测联动 ----
export interface XingceLink {
  category: XingceCategory;
  questionType: string;
  relevance: string;     // 与文章的关联说明
  originalText: string;  // 关联的原文
  testPoint: string;     // 考点
  sampleQuestion?: string; // 示例题
  skillTip: string;      // 解题技巧
}

export type XingceCategory =
  | "verbal"           // 言语理解
  | "judgment"         // 判断推理
  | "common_sense";    // 常识判断

export const XINGCE_CATEGORY_LABELS: Record<XingceCategory, string> = {
  verbal: "言语理解",
  judgment: "判断推理",
  common_sense: "常识判断",
};

// ---- 9. 政策溯源 ----
export interface PolicyTracing {
  relatedPolicies: PolicyRef[];   // 关联政策
  policyEvolution: string;        // 政策演进脉络
  implementationPath: string;    // 落地实施路径
  keyDocuments: string[];        // 关键文件清单
}

export interface PolicyRef {
  title: string;                 // 政策名称
  issuingBody: string;           // 发文机关
  publishDate?: string;          // 发布时间
  relevance: string;             // 与文章关联
  keyPoint: string;              // 核心要点
}

// ---- 10. 历史脉络 ----
export interface HistoricalContext {
  timeline: TimelineItem[];     // 时间线
  evolutionSummary: string;     // 演变总结
  currentStage: string;          // 当前阶段特征
  futureTrend: string;           // 未来趋势研判
}

export interface TimelineItem {
  year: string;
  event: string;
  significance: string;
}

// ---- 11. 同类对比 ----
export interface ComparativeAnalysis {
  perspectives: PerspectiveItem[]; // 多方视角
  mediaStances: MediaStance[];     // 媒体立场对比
  regionalDifferences?: string;    // 地域差异
  consensusAndDispute: string;      // 共识与分歧
}

export interface PerspectiveItem {
  viewpoint: string;               // 观点
  supporter: string;               // 持方
  reasoning: string;               // 立场依据
  evaluation: string;              // 客观评价
}

export interface MediaStance {
  mediaName: string;               // 媒体名称
  stance: string;                  // 立场倾向
  angle: string;                   // 报道角度
  difference: string;              // 与本文差异
}

// ---- 12. 写作迁移 ----
export interface WritingTransfer {
  templates: WritingTemplate[];    // 可复用模板
  techniques: TechniqueTransfer[]; // 可迁移技法
  commonPatterns: string[];        // 通用规律
  adaptationGuide: string;         // 迁移应用指南
}

export interface WritingTemplate {
  name: string;                    // 模板名称
  structure: string;               // 结构骨架
  placeholders: string[];          // 可替换槽位
  example: string;                 // 应用示例
  applicableScenarios: string[];   // 适用场景
}

export interface TechniqueTransfer {
  technique: string;               // 技法名称
  principle: string;               // 底层原理
  migration: string;               // 迁移方法
  example: string;                 // 迁移示例
}

// ---- 13. 思维模型 ----
export interface MentalModel {
  name: string;                    // 模型名称(如"系统思维""辩证思维")
  application: string;             // 在文中的应用
  explanation: string;             // 模型说明
  transferable: string;            // 可迁移场景
  relatedConcepts: string[];       // 关联概念
}

// ---- 14. 申论真题联动 ----
export interface ShenlunLink {
  year: string;                    // 年份
  region: string;                  // 地区(国考/省考)
  topic: string;                   // 真题主题
  relevance: string;               // 与本文关联
  questionType: "summary" | "analysis" | "countermeasure" | "essay" | "application";
  answerInspiration: string;       // 答题启示
  difficulty: "easy" | "medium" | "hard";
}

export const SHENLUN_TYPE_LABELS: Record<ShenlunLink["questionType"], string> = {
  summary: "归纳概括",
  analysis: "综合分析",
  countermeasure: "提出对策",
  essay: "文章论述",
  application: "应用文写作",
};

// ---- 思维导图 ----
export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  note?: string;
}

// ---- 仿写提示 ----
export interface WritingPrompt {
  topic: Topic;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  requirements: string[];
  referenceArticleId?: string;
}

// ---- 用户 ----
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  targetExam?: string;    // 目标考试：国考/省考/遴选/其他
  targetProvince?: string;
  registeredAt: string;
}

// ---- 练习记录 ----
export interface PracticeRecord {
  id: string;
  userId: string;
  promptId?: string;
  promptTitle: string;
  topic: Topic;
  userContent: string;     // 用户写的文章
  aiFeedback?: AIFeedback;
  score?: number;
  mode: PracticeMode;
  wordCount: number;
  timeSpent: number;       // 秒
  createdAt: string;
}

export interface AIFeedback {
  overallScore: number;    // 总分 0-100
  dimensionScores: DimensionScore[];
  strengths: string[];     // 亮点
  weaknesses: string[];    // 不足
  corrections: Correction[]; // 具体修改建议
  modelAnswer?: string;    // 参考范文
  improvedVersion?: string; // AI润色版
}

export interface DimensionScore {
  dimension: "logic" | "language" | "structure" | "content" | "argument";
  score: number;
  comment: string;
}

export interface Correction {
  original: string;
  suggestion: string;
  reason: string;
  position: string;  // 位置标记
}

export type PracticeMode =
  | "free"           // 自由仿写
  | "fill-blanks"    // 填空式
  | "restructure"    // 重组式（打乱段落重组）
  | "contrast"       // 对比式（给定范文模仿）
  | "continuation";  // 续写式

export const PRACTICE_MODE_LABELS: Record<PracticeMode, string> = {
  free: "自由仿写",
  "fill-blanks": "填空练习",
  restructure: "重组练习",
  contrast: "对比仿写",
  continuation: "续写练习",
};

// ---- 用户收藏/笔记 ----
export interface Bookmark {
  id: string;
  userId: string;
  articleId: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  articleId?: string;
  practiceId?: string;
  content: string;
  quoteText?: string;    // 引用的原文
  createdAt: string;
}
