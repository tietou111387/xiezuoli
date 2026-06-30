"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { TOPIC_LABELS, STRUCTURE_LABELS, ARGUMENTATION_LABELS, RHETORIC_LABELS, XINGCE_CATEGORY_LABELS } from "@/lib/types";

type TabKey =
  | "framework"
  | "argumentation"
  | "rhetoric"
  | "golden"
  | "vocabulary"
  | "xingce"
  | "prompts";

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: "framework", label: "逻辑框架", emoji: "🧩" },
  { key: "argumentation", label: "论证手法", emoji: "💡" },
  { key: "rhetoric", label: "修辞分析", emoji: "🎨" },
  { key: "golden", label: "金句摘录", emoji: "⭐" },
  { key: "vocabulary", label: "词汇积累", emoji: "📝" },
  { key: "xingce", label: "行测联动", emoji: "🧠" },
  { key: "prompts", label: "仿写提示", emoji: "✏️" },
];

export default function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [article, setArticle] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("framework");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setArticle(null);
    setError("");
    fetch(`/api/articles/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setArticle(null); }
        else setArticle(data);
      })
      .catch(() => { setError("加载失败"); setArticle(null); });
  }, [id]);

  const triggerAnalyze = async () => {
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.detail || data.error);
      setArticle((prev: any) => ({ ...prev, analysis: data.analysis }));
    } catch (e: any) {
      setError(e.message || "分析失败");
    }
    setAnalyzing(false);
  };

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">
        {error || "加载中..."}
      </div>
    );
  }

  const analysis = article.analysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 顶栏 */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/my-library" className="text-sm text-gray-500 hover:text-primary">
          ← 返回素材库
        </Link>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                        {(TOPIC_LABELS as Record<string, string>)[article.topic] || article.topic}
          </span>
          <span className="text-xs text-gray-400">{article.source_name}</span>
          <span className="text-xs text-gray-400">
            {article.publish_date?.slice(0, 10)}
          </span>
        </div>
      </div>

      {/* 双栏布局 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左栏：原文 */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">
              {article.title}
            </h1>
            <div
              className="article-content text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: article.content
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .split("\n")
                  .filter((p: string) => p.trim())
                  .map((p: string) => `<p>${p}</p>`)
                  .join(""),
              }}
            />
          </div>
        </div>

        {/* 右栏：AI分析面板 */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 sticky top-20">
            {/* Tab */}
            <div className="flex overflow-x-auto border-b border-gray-100 p-2 gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-primary text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>

            {/* 分析内容 */}
            <div className="p-4 analysis-scroll max-h-[calc(100vh-200px)] overflow-y-auto">
              {!analysis ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm mb-3">尚未拆解</p>
                  <button
                    onClick={triggerAnalyze}
                    disabled={analyzing}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
                  >
                    {analyzing ? "AI拆解中..." : "🤖 开始AI拆解"}
                  </button>
                  {error && (
                    <p className="text-red-500 text-xs mt-2">{error}</p>
                  )}
                </div>
              ) : (
                <AnalysisContent
                  tab={activeTab}
                  analysis={analysis}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisContent({ tab, analysis }: { tab: TabKey; analysis: any }) {
  switch (tab) {
    case "framework":
      return <FrameworkPanel analysis={analysis} />;
    case "argumentation":
      return <ArgumentationPanel analysis={analysis} />;
    case "rhetoric":
      return <RhetoricPanel analysis={analysis} />;
    case "golden":
      return <GoldenPanel analysis={analysis} />;
    case "vocabulary":
      return <VocabularyPanel analysis={analysis} />;
    case "xingce":
      return <XingcePanel analysis={analysis} />;
    case "prompts":
      return <PromptsPanel analysis={analysis} />;
    default:
      return null;
  }
}

function FrameworkPanel({ analysis }: { analysis: any }) {
  const fw = analysis.logicalFramework;
  if (!fw) return <EmptyPanel />;
  return (
    <div className="space-y-4">
      <Section title="文章结构" badge={(STRUCTURE_LABELS as Record<string, string>)[fw.structure] || fw.structure} />
      <Section title="中心论点" content={fw.thesis} />
      {fw.subTheses?.map((st: any, i: number) => (
        <div key={i} className="bg-blue-50 rounded-lg p-3">
          <p className="font-medium text-sm text-primary mb-2">
            分论点{i + 1}：{st.point}
          </p>
          {st.evidence?.length > 0 && (
            <div className="text-xs text-gray-600 space-y-1">
              <span className="font-medium">论据：</span>
              {st.evidence.map((e: string, j: number) => (
                <p key={j} className="ml-3">• {e}</p>
              ))}
            </div>
          )}
          {st.analysis && (
            <p className="text-xs text-gray-500 mt-2">
              <span className="font-medium">分析：</span>{st.analysis}
            </p>
          )}
        </div>
      ))}
      <Section title="结论" content={fw.conclusion} />
      {fw.outline?.length > 0 && (
        <div>
          <p className="font-medium text-sm text-gray-700 mb-2">段落大纲</p>
          <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
            {fw.outline.map((o: string, i: number) => (
              <li key={i}>{o}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function ArgumentationPanel({ analysis }: { analysis: any }) {
  const arg = analysis.argumentation;
  if (!arg) return <EmptyPanel />;
  return (
    <div className="space-y-4">
      {arg.methods?.length > 0 && (
        <div>
          <p className="font-medium text-sm text-gray-700 mb-2">论证方法</p>
          <div className="flex flex-wrap gap-1.5">
            {arg.methods.map((m: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                {(ARGUMENTATION_LABELS as Record<string, string>)[m] || m}
              </span>
            ))}
          </div>
        </div>
      )}
      {arg.highlights?.length > 0 && (
        <div>
          <p className="font-medium text-sm text-gray-700 mb-2">论证亮点</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {arg.highlights.map((h: string, i: number) => (
              <li key={i}>• {h}</li>
            ))}
          </ul>
        </div>
      )}
      {arg.dataUsage?.length > 0 && (
        <div>
          <p className="font-medium text-sm text-gray-700 mb-2">数据运用</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {arg.dataUsage.map((d: string, i: number) => (
              <li key={i}>• {d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RhetoricPanel({ analysis }: { analysis: any }) {
  const rh = analysis.rhetoric;
  if (!rh) return <EmptyPanel />;
  return (
    <div className="space-y-4">
      {rh.devices?.length > 0 && (
        <div>
          <p className="font-medium text-sm text-gray-700 mb-2">修辞手法</p>
          {rh.devices.map((d: any, i: number) => (
            <div key={i} className="bg-pink-50 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 bg-pink-200 text-pink-800 text-xs rounded">
                  {(RHETORIC_LABELS as Record<string, string>)[d.type] || d.type}
                </span>
                <span className="text-xs text-gray-400">段落{d.position}</span>
              </div>
              <p className="text-xs text-gray-700 mb-1">
                「{d.example}」
              </p>
              <p className="text-xs text-gray-500">{d.explanation}</p>
            </div>
          ))}
        </div>
      )}
      {rh.paragraphAnalysis?.length > 0 && (
        <div>
          <p className="font-medium text-sm text-gray-700 mb-2">逐段功能</p>
          {rh.paragraphAnalysis.map((p: any, i: number) => (
            <div key={i} className="text-xs text-gray-600 mb-2 pb-2 border-b border-gray-100 last:border-0">
              <span className="font-medium">第{p.paragraphIndex}段</span>
              <span className="text-gray-400 ml-2">({p.function})</span>
              <p className="mt-1">技法：{Array.isArray(p.techniques) ? p.techniques.join("、") : p.techniques}</p>
              <p className="text-gray-500">可学：{p.learnable}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GoldenPanel({ analysis }: { analysis: any }) {
  const gs = analysis.goldenSentences;
  if (!gs?.length) return <EmptyPanel />;
  return (
    <div className="space-y-3">
      {gs.map((s: any, i: number) => (
        <div key={i} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-amber-700 font-medium">
              {s.category === "opening" ? "开头" : s.category === "transition" ? "过渡" : s.category === "argument" ? "论证" : s.category === "closing" ? "结尾" : "引用"}
            </span>
          </div>
          <p className="text-sm text-gray-800 font-medium mb-1">「{s.text}」</p>
          <p className="text-xs text-gray-500 mb-1">适用：{s.usage}</p>
          {s.imitation && (
            <p className="text-xs text-primary bg-white rounded p-1.5">
              仿写：{s.imitation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function VocabularyPanel({ analysis }: { analysis: any }) {
  const vocab = analysis.vocabulary;
  if (!vocab?.length) return <EmptyPanel />;
  return (
    <div className="space-y-2">
      {vocab.map((v: any, i: number) => (
        <div key={i} className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-primary">{v.word}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              v.level === "advanced" ? "bg-red-100 text-red-700" :
              v.level === "intermediate" ? "bg-yellow-100 text-yellow-700" :
              "bg-green-100 text-green-700"
            }`}>
              {v.level === "advanced" ? "高级" : v.level === "intermediate" ? "中级" : "基础"}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-1">含义：{v.meaning}</p>
          <p className="text-xs text-gray-500 mb-1">语境：{v.context}</p>
          {v.alternatives?.length > 0 && (
            <p className="text-xs text-gray-400">
              近义：{v.alternatives.join("、")}
            </p>
          )}
          {v.usageExample && (
            <p className="text-xs text-primary mt-1 bg-white rounded p-1">
              造句：{v.usageExample}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function XingcePanel({ analysis }: { analysis: any }) {
  const xc = analysis.xingceLinks;
  if (!xc?.length) return <EmptyPanel />;
  return (
    <div className="space-y-3">
      {xc.map((x: any, i: number) => (
        <div key={i} className="bg-teal-50 rounded-lg p-3 border border-teal-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-teal-200 text-teal-800 px-1.5 py-0.5 rounded">
              {(XINGCE_CATEGORY_LABELS as Record<string, string>)[x.category] || x.category}
            </span>
            <span className="text-xs text-gray-500">{x.questionType}</span>
          </div>
          <p className="text-xs text-gray-600 mb-1">关联：{x.relevance}</p>
          <p className="text-xs text-teal-700 bg-white rounded p-1.5 mb-1">
            📍 原文：「{x.originalText}」
          </p>
          <p className="text-xs text-gray-700 font-medium">考点：{x.testPoint}</p>
          <p className="text-xs text-gray-500 mt-1">💡 技巧：{x.skillTip}</p>
          {x.sampleQuestion && (
            <p className="text-xs text-gray-600 mt-1 bg-white rounded p-1.5">
              示例题：{x.sampleQuestion}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function PromptsPanel({ analysis }: { analysis: any }) {
  const prompts = analysis.writingPrompts;
  if (!prompts?.length) return <EmptyPanel />;
  return (
    <div className="space-y-3">
      {prompts.map((p: any, i: number) => (
        <div key={i} className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
              p.difficulty === "hard" ? "bg-red-200 text-red-800" :
              p.difficulty === "medium" ? "bg-yellow-200 text-yellow-800" :
              "bg-green-200 text-green-800"
            }`}>
              {p.difficulty === "hard" ? "困难" : p.difficulty === "medium" ? "中等" : "简单"}
            </span>
            <span className="text-xs text-gray-500">{p.topic}</span>
          </div>
          <p className="font-medium text-sm mb-2">{p.title}</p>
          {p.requirements?.length > 0 && (
            <ul className="text-xs text-gray-600 space-y-0.5">
              {p.requirements.map((r: string, j: number) => (
                <li key={j}>• {r}</li>
              ))}
            </ul>
          )}
          <Link
            href={`/practice?prompt=${encodeURIComponent(p.title)}`}
            className="inline-block mt-2 text-xs text-primary font-medium hover:underline"
          >
            去练习 →
          </Link>
        </div>
      ))}
    </div>
  );
}

function Section({ title, content, badge }: { title: string; content?: string; badge?: string }) {
  if (!content && !badge) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <p className="font-medium text-sm text-gray-700">{title}</p>
        {badge && (
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
            {badge}
          </span>
        )}
      </div>
      {content && <p className="text-xs text-gray-600 leading-relaxed">{content}</p>}
    </div>
  );
}

function EmptyPanel() {
  return <p className="text-center text-gray-400 text-sm py-8">暂无数据</p>;
}
