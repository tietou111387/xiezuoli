// POST /api/fetch-article — 通过网址抓取文章正文
import { NextRequest, NextResponse } from "next/server";

interface FetchResult {
  title: string;
  content: string;
  author?: string;
  publishDate?: string;
  sourceName: string;
  url: string;
}

// 通用 HTML 正文提取 — 基于文本密度
function extractMainContent(html: string): { title: string; content: string; author?: string; publishDate?: string } {
  // 移除脚本和样式
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "");

  // 提取标题
  let title = "";
  const titleMatch = clean.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].replace(/<[^>]+>/g, "").trim().split(/[-_|–]/)[0].trim();
  }
  // og:title
  const ogTitle = clean.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (ogTitle) title = ogTitle[1].trim();

  // 提取作者
  let author: string | undefined;
  const authorMatch = clean.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i);
  if (authorMatch) author = authorMatch[1].trim();

  // 提取发布时间
  let publishDate: string | undefined;
  const dateMatch = clean.match(/<meta[^>]+property=["'](?:article:published_time|og:release_date)["'][^>]+content=["']([^"']+)["']/i);
  if (dateMatch) publishDate = dateMatch[1].trim();
  if (!publishDate) {
    const dateMatch2 = clean.match(/(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2})/);
    if (dateMatch2) publishDate = dateMatch2[1];
  }

  // 提取正文 — 直接在 cleaned html 上搜所有 p 标签
  // (不尝试 div 容器提取,因为正则无法处理嵌套 div 会截断)
  const content = clean;

  // 提取 p 标签文本
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let pMatch;
  while ((pMatch = pRegex.exec(content)) !== null) {
    const text = pMatch[1]
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#\d+;/g, "")
      .trim();
    if (text.length > 20) paragraphs.push(text);
  }

  // 如果 p 段落太少(<2),补充 div 内的长文本
  if (paragraphs.length < 2) {
    const divRegex = /<div[^>]*>([\s\S]*?)<\/div>/gi;
    let dMatch;
    while ((dMatch = divRegex.exec(content)) !== null && paragraphs.length < 10) {
      const text = dMatch[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim();
      if (text.length > 50 && !paragraphs.includes(text)) {
        paragraphs.push(text);
      }
    }
  }

  if (paragraphs.length === 0) {
    // 最后兜底:整个 HTML 去标签
    const fallback = content
      .replace(/<[^>]+>/g, "\n")
      .replace(/&nbsp;/g, " ")
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 20);
    paragraphs.push(...fallback);
  }

  return {
    title: title || "未命名文章",
    content: paragraphs.join("\n\n"),
    author,
    publishDate,
  };
}

function extractSourceName(url: string, html: string): string {
  // 尝试从 og:site_name 获取
  const siteName = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
  if (siteName) return siteName[1].trim();
  // 从域名推断
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const domain = host.split(".")[0];
    // 中文常见媒体域名映射
    const domainMap: Record<string, string> = {
      "people": "人民网",
      "xinhuanet": "新华网",
      "gmw": "光明网",
      "cctv": "央视网",
      "ce": "经济日报",
      "qstheory": "求是网",
      "news": "新闻",
      "chinadaily": "中国日报",
      "gxrb": "广西日报",
      "ngzb": "南国早报",
    };
    return domainMap[domain] || domain;
  } catch {
    return "网络来源";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "缺少 url 参数" }, { status: 400 });
    }

    // 校验 URL
    let validUrl: string;
    try {
      validUrl = new URL(url).toString();
    } catch {
      return NextResponse.json({ error: "URL 格式不正确" }, { status: 400 });
    }

    // 抓取页面
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    let res: Response;
    try {
      res = await fetch(validUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        },
        redirect: "follow",
      });
    } catch (e: any) {
      return NextResponse.json(
        { error: "抓取失败", detail: `无法访问该网址: ${e.message}` },
        { status: 502 },
      );
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "抓取失败", detail: `HTTP ${res.status} ${res.statusText}` },
        { status: 502 },
      );
    }

    const html = await res.text();
    if (!html || html.length < 100) {
      return NextResponse.json(
        { error: "抓取失败", detail: "页面内容为空或过短" },
        { status: 502 },
      );
    }

    const extracted = extractMainContent(html);
    const sourceName = extractSourceName(validUrl, html);

    if (!extracted.content || extracted.content.length < 50) {
      return NextResponse.json(
        { error: "正文提取失败", detail: "无法从页面提取有效正文,该网站可能有反爬措施或需要登录" },
        { status: 422 },
      );
    }

    const result: FetchResult = {
      title: extracted.title,
      content: extracted.content,
      author: extracted.author,
      publishDate: extracted.publishDate,
      sourceName,
      url: validUrl,
    };

    return NextResponse.json({ success: true, article: result });
  } catch (e: any) {
    console.error("抓取文章失败:", e);
    return NextResponse.json(
      { error: "抓取失败", detail: e.message },
      { status: 500 },
    );
  }
}
