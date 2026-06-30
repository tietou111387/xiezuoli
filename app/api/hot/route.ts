// GET /api/hot — 每日热点聚合
// 调用 uapis.cn 免费全网热榜聚合API
import { NextResponse } from "next/server";

const HOT_SOURCES = [
  { type: "weibo", name: "微博热搜", emoji: "🔥", priority: "high" },
  { type: "zhihu", name: "知乎热榜", emoji: "💡", priority: "high" },
  { type: "toutiao", name: "今日头条", emoji: "📰", priority: "high" },
  { type: "baidu", name: "百度热搜", emoji: "🔍", priority: "high" },
  { type: "douyin", name: "抖音热点", emoji: "🎵", priority: "medium" },
  { type: "bilibili", name: "B站热门", emoji: "📺", priority: "medium" },
] as const;

// 申论相关性关键词——出现这些词的条目优先级提升
const SHENLUN_KEYWORDS = [
  "政策", "改革", "发展", "治理", "民生", "经济", "法治", "生态",
  "文化", "教育", "科技", "乡村", "脱贫", "创新", "安全", "外交",
  "党建", "反腐", "干部", "基层", "群众", "会议", "讲话", "批示",
  "规划", "战略", "方针", "路线", "思想", "理论", "制度", "体系",
];

function calcRelevance(title: string): number {
  let score = 0;
  for (const kw of SHENLUN_KEYWORDS) {
    if (title.includes(kw)) score += 10;
  }
  return score;
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      HOT_SOURCES.map(async (src) => {
        const url = `https://uapis.cn/api/v1/misc/hotboard?type=${src.type}`;
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        try {
          const res = await fetch(url, {
            signal: ctrl.signal,
            headers: { "Accept": "application/json" },
          });
          if (!res.ok) throw new Error(`${src.name} HTTP ${res.status}`);
          const data = await res.json();
          const list: any[] = Array.isArray(data?.list) ? data.list : [];
          return {
            source: src.name,
            emoji: src.emoji,
            priority: src.priority,
            updateTime: data.update_time || "",
            items: list.slice(0, 15).map((item: any, idx: number) => ({
              rank: idx + 1,
              title: String(item?.title ?? ""),
              hot: String(item?.hot_value ?? ""),
              url: String(item?.url ?? ""),
              relevance: calcRelevance(String(item?.title ?? "")),
            })),
          };
        } catch (e: any) {
          // 单个源失败不影响整体,返回空列表
          console.warn(`[hot] ${src.name} 获取失败:`, e.message);
          return {
            source: src.name,
            emoji: src.emoji,
            priority: src.priority,
            updateTime: "",
            items: [],
          };
        } finally {
          clearTimeout(timer);
        }
      }),
    );

    const boards: any[] = [];
    const failed: string[] = [];
    for (const r of results) {
      if (r.status === "fulfilled" && r.value?.items?.length > 0) {
        boards.push(r.value);
      } else {
        const src = (r as any).value?.source || "未知源";
        failed.push(src);
      }
    }

    // 跨平台聚合:按申论相关性排序的Top榜
    const allItems: any[] = [];
    for (const b of boards) {
      for (const item of b.items) {
        allItems.push({ ...item, source: b.source, sourceEmoji: b.emoji });
      }
    }
    // 去重(按标题)
    const seen = new Set<string>();
    const unique = allItems.filter((it) => {
      const key = it.title.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // 按相关性 + 热度综合排序
    const shenlunTop = unique
      .filter((it) => it.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance || b.rank - a.rank)
      .slice(0, 30);

    return NextResponse.json({
      success: true,
      updateTime: new Date().toISOString(),
      boards,
      shenlunTop,
      failedSources: failed,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "热点获取失败", detail: e.message },
      { status: 500 },
    );
  }
}
