"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HotItem {
  rank: number;
  title: string;
  hot: string;
  url: string;
  relevance: number;
  source?: string;
  sourceEmoji?: string;
}

interface HotBoard {
  source: string;
  emoji: string;
  priority: string;
  updateTime: string;
  items: HotItem[];
}

interface HotData {
  success: boolean;
  updateTime: string;
  boards: HotBoard[];
  shenlunTop: HotItem[];
  failedSources: string[];
}

export default function HotPage() {
  const [data, setData] = useState<HotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeBoard, setActiveBoard] = useState(0);

  useEffect(() => {
    fetch("/api/hot")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.detail || d.error);
        else setData(d);
      })
      .catch((e) => setError(e.message || "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
        <div className="animate-pulse text-4xl mb-3">🔥</div>
        <p>正在聚合40+平台热搜...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 mb-2">⚠️ {error}</p>
        <button
          onClick={() => location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
        >
          重试
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 顶部 */}
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-primary">
          ← 返回首页
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-2">
          <span>🔥</span> 每日热点聚合
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          更新时间: {new Date(data.updateTime).toLocaleString("zh-CN")} ·
          按申论相关性智能排序
        </p>
      </div>

      {/* 申论精选榜 */}
      {data.shenlunTop.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎯</span>
            <h2 className="font-bold text-gray-900">申论精选热点</h2>
            <span className="text-xs text-gray-500">
              (按相关性排序,共{data.shenlunTop.length}条)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.shenlunTop.slice(0, 12).map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-lg p-3 hover:shadow-sm transition-all border border-transparent hover:border-red-200"
              >
                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < 3 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{item.sourceEmoji} {item.source}</span>
                    {item.relevance > 0 && (
                      <span className="text-xs text-red-500">
                        相关度 +{item.relevance}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 分平台展示 */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tab */}
        <div className="flex overflow-x-auto border-b border-gray-100 p-2 gap-1">
          {data.boards.map((board, i) => (
            <button
              key={i}
              onClick={() => setActiveBoard(i)}
              className={`shrink-0 px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
                activeBoard === i
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {board.emoji} {board.source}
              <span className="ml-1 text-xs opacity-70">({board.items.length})</span>
            </button>
          ))}
        </div>

        {/* 当前榜单 */}
        {data.boards[activeBoard] && (
          <div className="p-4">
            <p className="text-xs text-gray-400 mb-3">
              更新: {data.boards[activeBoard].updateTime}
            </p>
            <div className="space-y-1">
              {data.boards[activeBoard].items.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-md hover:bg-gray-50 transition-colors group"
                >
                  <span className={`shrink-0 w-7 text-center text-sm font-bold ${
                    i < 3 ? "text-red-500" : "text-gray-400"
                  }`}>
                    {item.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 group-hover:text-primary truncate">
                      {item.title}
                    </p>
                  </div>
                  {item.hot && (
                    <span className="text-xs text-orange-500 shrink-0">
                      🔥 {item.hot}
                    </span>
                  )}
                  {item.relevance > 0 && (
                    <span className="shrink-0 px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] rounded">
                      申论 +{item.relevance}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 失败源提示 */}
      {data.failedSources.length > 0 && (
        <p className="text-xs text-gray-400 mt-4 text-center">
          部分源获取失败: {data.failedSources.length} 个
        </p>
      )}

      {/* 跳转采集 */}
      <div className="mt-6 text-center">
        <Link
          href="/my-library"
          className="inline-block px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light"
        >
          去素材库查找官媒深度报道 →
        </Link>
      </div>
    </div>
  );
}
