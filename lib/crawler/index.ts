// 官媒文章采集引擎
// RSS + HTML 混合爬取，自动去重、分类存储

import { MediaSource, Article, Topic } from "../types";
import { getDb, genId } from "../db";

// ---- 预设官媒源（20个平台，覆盖全国+广西全行业） ----
export const DEFAULT_SOURCES: Omit<MediaSource, "id">[] = [
  // ========== 全国性官媒（12个） ==========
  {
    name: "人民日报",
    type: "national",
    url: "https://www.people.com.cn",
    rssUrl: "http://www.people.com.cn/rss/politics.xml",
    crawlerType: "rss",
  },
  {
    name: "人民日报-评论",
    type: "national",
    url: "https://opinion.people.com.cn",
    rssUrl: "http://opinion.people.com.cn/rss/opinion.xml",
    crawlerType: "rss",
  },
  {
    name: "新华社",
    type: "national",
    url: "https://www.xinhuanet.com",
    rssUrl: "http://www.xinhuanet.com/politics/xhll.xml",
    crawlerType: "rss",
  },
  {
    name: "求是",
    type: "national",
    url: "https://www.qstheory.cn",
    crawlerType: "html",
  },
  {
    name: "学习时报",
    type: "national",
    url: "https://www.studytimes.cn",
    crawlerType: "html",
  },
  {
    name: "光明日报",
    type: "national",
    url: "https://www.gmw.cn",
    crawlerType: "html",
  },
  {
    name: "经济日报",
    type: "national",
    url: "https://www.ce.cn",
    crawlerType: "html",
  },
  {
    name: "中国青年报",
    type: "national",
    url: "https://www.cyol.com",
    crawlerType: "html",
  },
  {
    name: "法制日报",
    type: "national",
    url: "https://www.legaldaily.com.cn",
    crawlerType: "html",
  },
  {
    name: "科技日报",
    type: "national",
    url: "https://www.stdaily.com",
    crawlerType: "html",
  },
  {
    name: "农民日报",
    type: "national",
    url: "https://www.farmer.com.cn",
    crawlerType: "html",
  },
  {
    name: "中国教育报",
    type: "national",
    url: "https://www.jyb.cn",
    crawlerType: "html",
  },
  // ========== 广西地方官媒（8个，全行业覆盖） ==========
  {
    name: "广西日报",
    type: "provincial",
    province: "广西",
    url: "https://www.gxrb.com.cn",
    crawlerType: "html",
  },
  {
    name: "当代广西",
    type: "provincial",
    province: "广西",
    url: "https://www.ddgx.cn",
    crawlerType: "html",
  },
  {
    name: "南国早报",
    type: "provincial",
    province: "广西",
    url: "https://www.ngzb.com.cn",
    crawlerType: "html",
  },
  {
    name: "广西新闻网",
    type: "provincial",
    province: "广西",
    url: "https://www.gxnews.com.cn",
    crawlerType: "html",
  },
  {
    name: "南宁日报",
    type: "municipal",
    province: "广西",
    city: "南宁",
    url: "https://www.nnrb.com.cn",
    crawlerType: "html",
  },
  {
    name: "广西法治日报",
    type: "provincial",
    province: "广西",
    url: "https://www.gxfzrb.com",
    crawlerType: "html",
  },
  {
    name: "广西日报-经济观察",
    type: "provincial",
    province: "广西",
    url: "https://www.gxrb.com.cn",
    crawlerType: "html",
  },
  {
    name: "广西科技报",
    type: "provincial",
    province: "广西",
    url: "https://www.gxkjb.com",
    crawlerType: "html",
  },
];

// ---- RSS 解析 ----
export async function fetchFromRSS(source: MediaSource): Promise<Partial<Article>[]> {
  if (!source.rssUrl) return [];

  try {
    const res = await fetch(source.rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; XieZuoLi/1.0)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const xml = await res.text();

    // 简易XML解析（避免引入额外依赖）
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    return items.map((item) => {
      const title = extractTag(item, "title");
      const link = extractTag(item, "link");
      const pubDate = extractTag(item, "pubDate") || extractTag(item, "dc:date");
      const description = extractTag(item, "description");
      const content = extractTag(item, "content:encoded") || description || "";

      return {
        title: cleanHtml(title),
        url: link,
        publishDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        content: cleanHtml(content),
        sourceId: source.id,
        sourceName: source.name,
      };
    }).filter((a) => a.title && a.url && a.content);
  } catch (e) {
    console.error(`RSS fetch failed for ${source.name}:`, e);
    return [];
  }
}

// ---- HTML 爬取 ----
export async function fetchFromHTML(source: MediaSource): Promise<Partial<Article>[]> {
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; XieZuoLi/1.0)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // 提取文章列表（各站结构不同，用通用方法）
    const articleLinks = extractArticleLinks(html, source.url);
    return articleLinks.filter((a) => a.title && a.url);
  } catch (e) {
    console.error(`HTML fetch failed for ${source.name}:`, e);
    return [];
  }
}

// ---- 采集流程 ----
export async function collectArticles(): Promise<number> {
  const db = getDb();

  // 确保预设源已入库
  await ensureSources();

  // 列名为蛇形，映射为 MediaSource 驼峰字段，否则 crawlerType/rssUrl 恒为 undefined
  const sources = db
    .prepare(
      "SELECT id, name, type, province, city, url, rss_url AS rssUrl, crawler_type AS crawlerType FROM media_sources",
    )
    .all() as MediaSource[];

  let collected = 0;

  for (const source of sources) {
    let articles: Partial<Article>[] = [];

    if (source.crawlerType === "rss") {
      articles = await fetchFromRSS(source);
    } else {
      articles = await fetchFromHTML(source);
    }

    // 入库（双重去重：URL + 标题相似度）
    const insert = db.prepare(`
      INSERT OR IGNORE INTO articles
        (id, title, author, source_id, source_name, publish_date, url, content, topic, province, city, word_count, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 预取已有标题做相似度匹配
    const existingTitles = db.prepare("SELECT id, title FROM articles WHERE source_id = ?").all(source.id) as { id: string; title: string }[];

    for (const article of articles) {
      if (!article.title || !article.url) continue;
      // HTML爬虫无正文时用标题+topic描述作为占位内容
      const content = article.content || article.title;

      // 标题去重：长标题取前20字比较
      const shortTitle = article.title.slice(0, 20);
      const duplicate = existingTitles.find((e) => {
        const eShort = e.title.slice(0, 20);
        return eShort === shortTitle || similarTitle(e.title, article.title!);
      });
      if (duplicate) {
        continue; // 跳过重复
      }

      const id = genId();
      const topic = classifyTopic(article.title + " " + content.slice(0, 500));

      insert.run(
        id,
        article.title,
        article.author || null,
        source.id,
        source.name,
        article.publishDate || new Date().toISOString(),
        article.url,
        content,
        topic,
        source.province || null,
        source.city || null,
        content.length,
        JSON.stringify([topic]),
      );
      collected++;
    }
  }

  return collected;
}

// ---- 辅助函数 ----
async function ensureSources() {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR IGNORE INTO media_sources (id, name, type, province, city, url, rss_url, crawler_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const src of DEFAULT_SOURCES) {
    const id = Buffer.from(src.name).toString("base64").slice(0, 16);
    insert.run(
      id,
      src.name,
      src.type,
      src.province || null,
      src.city || null,
      src.url,
      src.rssUrl || null,
      src.crawlerType,
    );
  }
}

function similarTitle(a: string, b: string): boolean {
  // 简单 Jaccard 相似度，基于2-gram字符集
  const ngrams = (s: string) => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };
  const sa = ngrams(a);
  const sb = ngrams(b);
  let intersection = 0;
  for (const g of sa) if (sb.has(g)) intersection++;
  const union = sa.size + sb.size - intersection;
  return union > 0 && intersection / union > 0.5;
}

function classifyTopic(text: string): Topic {
  const keywords: Record<Topic, string[]> = {
    economy: ["经济", "GDP", "产业", "财政", "金融", "消费", "投资", "贸易", "市场"],
    livelihood: ["民生", "就业", "医疗", "养老", "住房", "社保", "收入", "扶贫"],
    ecology: ["生态", "环保", "绿色", "低碳", "污染", "碳中和", "环境"],
    culture: ["文化", "文博", "非遗", "传统", "艺术", "旅游", "文艺"],
    governance: ["治理", "基层", "社区", "服务", "改革", "制度", "行政", "政务"],
    politics: ["政治", "党建", "反腐", "纪律", "组织", "思想", "路线", "民主"],
    law: ["法治", "法律", "司法", "执法", "立法", "依法", "合规"],
    education: ["学校", "教师", "学生", "高考", "课程", "双减", "高校"],
    tech: ["科技", "数字", "智能", "AI", "创新", "芯片", "互联网", "5G", "技术"],
    agriculture: ["三农", "农村", "农民", "农业", "粮食", "耕地", "畜牧"],
  };

  const scores = Object.entries(keywords).map(([topic, words]) => {
    const score = words.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0);
    return { topic: topic as Topic, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].topic : "governance";
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i");
  const cdata = xml.match(re);
  if (cdata) return cdata[1];

  const re2 = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(re2);
  return match ? match[1] : "";
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractArticleLinks(html: string, baseUrl: string): Partial<Article>[] {
  const results: Partial<Article>[] = [];

  // 匹配 <a> 标签（含标题文本和链接）
  const linkRe = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkRe.exec(html)) !== null) {
    const href = match[1];
    const text = cleanHtml(match[2]);

    // 过滤导航、footer等无用链接
    if (!text || text.length < 8 || text.length > 200) continue;
    if (/首页|登录|注册|关于|版权|更多/.test(text)) continue;

    const url = href.startsWith("http") ? href : new URL(href, baseUrl).href;

    results.push({
      title: text,
      url,
      publishDate: new Date().toISOString(),
      content: "", // HTML爬取只获取列表，全文需要二次请求
    });
  }

  return results.slice(0, 50);
}

// ---- 定时采集 ----
let collectTimer: ReturnType<typeof setInterval> | null = null;

export function startAutoCollect(intervalMs = 3600000) {
  // 默认每小时采集
  console.log(`[Collect] Auto-collect started, interval=${intervalMs}ms`);
  collectArticles()
    .then((n) => console.log(`[Collect] Initial: ${n} articles`))
    .catch((e) => console.error("[Collect] Initial error:", e));

  collectTimer = setInterval(() => {
    collectArticles()
      .then((n) => console.log(`[Collect] Collected: ${n} articles`))
      .catch((e) => console.error("[Collect] Error:", e));
  }, intervalMs);
}

export function stopAutoCollect() {
  if (collectTimer) {
    clearInterval(collectTimer);
    collectTimer = null;
  }
}
