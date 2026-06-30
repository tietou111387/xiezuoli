"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalArticles: number;
  totalAnalyzed: number;
  totalPractice: number;
  avgScore: number;
  recentPractice: any[];
}

export default function ProfilePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const triggerCollect = async () => {
    try {
      const res = await fetch("/api/collect", { method: "POST" });
      const data = await res.json();
      alert(`采集完成，新增 ${data.collected} 篇文章`);
      fetchStats();
    } catch (e: any) {
      alert("采集失败: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">我的</h1>
        <p className="text-gray-500 mt-1">学习进度与统计</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="素材总量"
          value={stats?.totalArticles || 0}
          unit="篇"
          icon="📰"
        />
        <StatCard
          title="已拆解"
          value={stats?.totalAnalyzed || 0}
          unit="篇"
          icon="🔬"
        />
        <StatCard
          title="练习次数"
          value={stats?.totalPractice || 0}
          unit="次"
          icon="✏️"
        />
        <StatCard
          title="平均得分"
          value={stats?.avgScore || 0}
          unit="分"
          icon="📊"
          highlight
        />
      </div>

      {/* 操作区 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="font-bold text-lg mb-4">快捷操作</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={triggerCollect}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
          >
            📡 立即采集官媒文章
          </button>
          <button
            onClick={async () => {
              try {
                await fetch("/api/seed", { method: "POST" });
                alert("示例数据已生成");
                fetchStats();
              } catch (e: any) {
                alert("失败: " + e.message);
              }
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            🌱 生成示例数据
          </button>
        </div>
      </div>

      {/* 最近练习 */}
      {stats?.recentPractice && stats.recentPractice.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-lg mb-4">最近练习</h2>
          <div className="space-y-3">
            {stats.recentPractice.map((p: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {p.prompt_title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {p.created_at?.slice(0, 10)} · {p.word_count}字 · {p.mode}
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">
                  {p.score}分
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  unit,
  icon,
  highlight,
}: {
  title: string;
  value: number;
  unit: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-gray-500">{title}</span>
      </div>
      <p
        className={`text-3xl font-bold ${
          highlight ? "text-accent" : "text-gray-900"
        }`}
      >
        {value}
        <span className="text-base font-normal text-gray-400 ml-1">
          {unit}
        </span>
      </p>
    </div>
  );
}
