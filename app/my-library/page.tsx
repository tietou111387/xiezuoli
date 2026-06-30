"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TOPIC_LABELS, Topic } from "@/lib/types";

interface ArticleItem {
  id: string;
  title: string;
  source_name: string;
  topic: Topic;
  province: string | null;
  city: string | null;
  publish_date: string;
  word_count: number;
  is_processed: number;
  summary?: string;
}

export default function MyLibraryPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (keyword) params.set("q", keyword);

    try {
      const res = await fetch(`/api/articles?${params}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [page, keyword]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 标题 + 新建拆解 */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📚 我的素材库</h1>
          <p className="text-gray-500 mt-1 text-sm">
            所有已拆解的文章都在这里 · 共 {total} 篇
          </p>
        </div>
        <Link
          href="/analyze-text"
          className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
        >
          + 文本拆解新文章
        </Link>
      </div>

      {/* 搜索 */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
        <input
          type="text"
          placeholder="搜索标题或内容..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setPage(1)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-lg mb-2">还没有拆解过的文章</p>
          <p className="text-sm mb-4">复制文章全文粘贴到"文本拆解",AI 深度拆解,开始你的积累</p>
          <Link
            href="/analyze-text"
            className="inline-block px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light"
          >
            去拆解第一篇
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                      {(TOPIC_LABELS as Record<string, string>)[article.topic] || article.topic}
                    </span>
                    {article.is_processed ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                        已拆解
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                        待拆解
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-gray-400 shrink-0">
                  <div>{article.source_name}</div>
                  <div className="mt-1">
                    {article.publish_date?.slice(0, 10)}
                  </div>
                  <div>{article.word_count}字</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-30"
          >
            上一页
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-30"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
