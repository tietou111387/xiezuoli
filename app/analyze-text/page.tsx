"use client";

import { useState } from "react";
import Link from "next/link";

export default function AnalyzeTextPage() {
  const [title, setTitle] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    articleId: string;
    title: string;
    contentLength: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (content.trim().length < 50) {
      setError("正文太短,至少需要50字");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setStep("AI 14维拆解中（约30-90秒）...");

    try {
      const res = await fetch("/api/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          sourceName: sourceName.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.detail || data.error);
      } else {
        setResult({
          articleId: data.articleId,
          title: data.title,
          contentLength: data.contentLength,
        });
      }
    } catch (e: any) {
      setError(e.message || "请求失败");
    } finally {
      setLoading(false);
      setStep("");
    }
  };

  const charCount = content.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📝 文本拆解</h1>
        <p className="text-gray-500 mt-1 text-sm">
          复制文章标题和正文粘贴到下方,AI 自动 14 维深度拆解
        </p>
      </div>

      {/* 输入表单 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            文章标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="粘贴文章标题"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled={loading}
          />
        </div>

        {/* 来源 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            来源 <span className="text-gray-400 text-xs">(可选)</span>
          </label>
          <input
            type="text"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="如:人民日报、广西日报、新华网"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled={loading}
          />
        </div>

        {/* 正文 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              文章正文 <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs ${charCount < 50 ? "text-red-400" : "text-gray-400"}`}>
              {charCount} 字 {charCount < 50 ? "(至少50字)" : ""}
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="复制文章全文粘贴到这里..."
            rows={12}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y font-mono"
            disabled={loading}
          />
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !title.trim() || content.trim().length < 50}
            className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {loading ? "拆解中..." : "🤖 开始 AI 拆解"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTitle("");
              setSourceName("");
              setContent("");
              setError("");
              setResult(null);
            }}
            className="px-4 py-2.5 text-gray-500 text-sm hover:text-gray-700"
            disabled={loading}
          >
            清空
          </button>
        </div>
      </form>

      {/* 状态 */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mb-3"></div>
          <p className="text-sm text-blue-700">{step}</p>
          <p className="text-xs text-blue-400 mt-1">14维拆解需要较长时间,请耐心等待</p>
        </div>
      )}

      {/* 错误 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700 font-medium">⚠️ 拆解失败</p>
          <p className="text-xs text-red-500 mt-1 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {/* 成功结果 */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">✅</span>
            <h3 className="font-bold text-green-800">拆解完成!</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">标题:</span>
              <span className="text-gray-800 font-medium ml-2">{result.title}</span>
            </div>
            <div>
              <span className="text-gray-500">字数:</span>
              <span className="text-gray-800 ml-2">{result.contentLength} 字</span>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Link
              href={`/article/${result.articleId}`}
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              查看 14 维拆解 →
            </Link>
            <Link
              href="/my-library"
              className="px-5 py-2 bg-white text-green-700 border border-green-300 rounded-lg text-sm font-medium hover:bg-green-50"
            >
              我的素材库
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setTitle("");
                setSourceName("");
                setContent("");
              }}
              className="px-5 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              拆解下一篇
            </button>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-bold text-gray-700 mb-3 text-sm">使用说明</h3>
        <ol className="text-xs text-gray-500 space-y-2 leading-relaxed list-decimal list-inside">
          <li>打开任意图文页面(人民日报、新华网、广西日报等),复制文章全文。</li>
          <li>粘贴到上方"文章正文"文本框,填写标题和来源。</li>
          <li>点击"开始 AI 拆解",AI 将从 14 个维度深度拆解文章。</li>
          <li>拆解完成后自动存入"我的素材库",可随时回顾。</li>
          <li>14 维拆解包括:逻辑/论证/修辞/金句/词汇/行测/政策溯源/历史脉络/对比分析/写作迁移/思维模型/申论真题联动。</li>
        </ol>
      </div>
    </div>
  );
}
