"use client";

import { useState } from "react";
import { TOPIC_LABELS, PRACTICE_MODE_LABELS, Topic, PracticeMode } from "@/lib/types";

const TOPICS: Topic[] = [
  "economy", "livelihood", "ecology", "culture",
  "governance", "politics", "law", "education", "tech", "agriculture",
];

const MODES: PracticeMode[] = ["free", "fill-blanks", "restructure", "contrast", "continuation"];

const MODE_DESCRIPTIONS: Record<PracticeMode, string> = {
  free: "根据话题自由写作，AI从逻辑、语言、结构、内容、论证五个维度批改打分。",
  "fill-blanks": "文章中挖空关键词/句式，你需要填入最合适的表达，训练词汇和句式敏感度。",
  restructure: "文章段落被打乱，你需要重新排列成逻辑通顺的原文，训练结构感知。",
  contrast: "先读范文再写，AI同时对比你与范文的差异，直观看差距。",
  continuation: "给出文章开篇，你续写后半部分，AI评估衔接度和风格一致性。",
};

export default function PracticePage() {
  const [topic, setTopic] = useState<Topic>("governance");
  const [mode, setMode] = useState<PracticeMode>("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [requirements, setRequirements] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("请填写标题和内容");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptTitle: title,
          topic,
          content,
          requirements: requirements
            .split("\n")
            .filter((r) => r.trim()),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.detail || data.error);
      setFeedback(data.feedback);
    } catch (e: any) {
      setError(e.message || "提交失败");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">仿写练习</h1>
        <p className="text-gray-500 mt-1">多话题 · 多模式 · AI精准批改</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧：编辑区 */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* 话题 + 模式选择 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  话题分类
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value as Topic)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {TOPIC_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  练习模式
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as PracticeMode)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {MODES.map((m) => (
                    <option key={m} value={m}>
                      {PRACTICE_MODE_LABELS[m]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{MODE_DESCRIPTIONS[mode]}</p>
          </div>

          {/* 标题输入 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <input
              type="text"
              placeholder="练习标题，如：关于发展新质生产力的思考"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* 写作要求 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <textarea
              placeholder="写作要求（可选，每行一条）：&#10;1. 字数不少于800字&#10;2. 必须包含对策建议&#10;3. 引用至少一个政策文件"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* 编辑器 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <textarea
              placeholder="在此写作..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y font-mono"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                字数：{content.length}
              </span>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {submitting ? "AI批改中..." : "提交批改"}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-2">{error}</p>
            )}
          </div>
        </div>

        {/* 右侧：批改结果 */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 sticky top-20">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">AI批改结果</h3>
            </div>
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {!feedback ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">📝</p>
                  <p>写完点击「提交批改」</p>
                  <p className="mt-1">AI将从五大维度评分</p>
                </div>
              ) : (
                <FeedbackPanel feedback={feedback} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackPanel({ feedback }: { feedback: any }) {
  return (
    <div className="space-y-4">
      {/* 总分 */}
      <div className="text-center py-4 bg-primary/5 rounded-lg">
        <p className="text-3xl font-bold text-primary">{feedback.overallScore}</p>
        <p className="text-xs text-gray-500 mt-1">总分（满分100）</p>
      </div>

      {/* 维度得分 */}
      {feedback.dimensionScores?.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">各维度评分</p>
          {feedback.dimensionScores.map((ds: any, i: number) => {
            const labels: Record<string, string> = {
              logic: "逻辑性", language: "语言表达", structure: "结构完整",
              content: "内容深度", argument: "论证力度",
            };
            const maxScores: Record<string, number> = {
              logic: 25, language: 25, structure: 20, content: 20, argument: 10,
            };
            const max = maxScores[ds.dimension] || 25;
            const pct = (ds.score / max) * 100;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-16 shrink-0">
                  {labels[ds.dimension] || ds.dimension}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-10 text-right">
                  {ds.score}/{max}
                </span>
                <span className="text-xs text-gray-400">{ds.comment}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* 亮点 */}
      {feedback.strengths?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-green-700 mb-1">✨ 亮点</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {feedback.strengths.map((s: string, i: number) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 不足 */}
      {feedback.weaknesses?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-red-600 mb-1">⚠️ 待改进</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {feedback.weaknesses.map((w: string, i: number) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 批改建议 */}
      {feedback.corrections?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">🔧 具体修改</p>
          {feedback.corrections.map((c: any, i: number) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-xs text-red-600 line-through mb-1">
                {c.original}
              </p>
              <p className="text-xs text-green-700 mb-1">
                → {c.suggestion}
              </p>
              <p className="text-xs text-gray-400">
                {c.position} · {c.reason}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 润色版 */}
      {feedback.improvedVersion && (
        <div>
          <p className="text-sm font-medium text-primary mb-1">🖋️ AI润色版</p>
          <div className="bg-blue-50 rounded-lg p-3 text-xs leading-relaxed text-gray-700">
            {feedback.improvedVersion}
          </div>
        </div>
      )}

      {/* 参考范文 */}
      {feedback.modelAnswer && (
        <div>
          <p className="text-sm font-medium text-amber-700 mb-1">📖 参考范文</p>
          <div className="bg-amber-50 rounded-lg p-3 text-xs leading-relaxed text-gray-700">
            {feedback.modelAnswer}
          </div>
        </div>
      )}
    </div>
  );
}
