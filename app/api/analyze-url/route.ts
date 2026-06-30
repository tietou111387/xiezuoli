// POST /api/analyze-url — 通过网址抓取+拆解一体化
import { NextRequest, NextResponse } from "next/server";
import { getDb, genId } from "@/lib/db";
import { analyzeArticle } from "@/lib/ai";
import { parseJSONSafe } from "@/lib/json-extract";
import type { Article } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "缺少 url 参数" }, { status: 400 });
    }

    let validUrl: string;
    try {
      validUrl = new URL(url).toString();
    } catch {
      return NextResponse.json({ error: "URL 格式不正确" }, { status: 400 });
    }

    // ---- 步骤0:数字报URL改写(桌面SPA版→移动端API版) ----
    // ponytail: 广西日报等数字报桌面URL是Swiper SPA,无正文;
    // 改写为移动端API端点直接拿HTML。升级路径:抽象为域名→rewrite模板映射。
    validUrl = rewriteDigitalPaperUrl(validUrl);

    // ---- 步骤1:抓取文章 ----
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
        { error: "抓取失败", detail: `无法访问: ${e.message}` },
        { status: 502 },
      );
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "抓取失败", detail: `HTTP ${res.status}` },
        { status: 502 },
      );
    }

    const html = await res.text();

    // ---- 步骤2:提取正文 ----
    // 移除脚本/样式/导航
    const clean = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "");

    // 标题
    let title = "";
    const ogTitle = clean.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    if (ogTitle) title = ogTitle[1].trim();
    else {
      const tMatch = clean.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (tMatch) title = tMatch[1].replace(/<[^>]+>/g, "").trim().split(/[-_|–]/)[0].trim();
    }

    // 作者
    let author: string | undefined;
    const authorMatch = clean.match(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i);
    if (authorMatch) author = authorMatch[1].trim();

    // 发布时间
    let publishDate: string | undefined;
    const dateMatch = clean.match(/<meta[^>]+property=["'](?:article:published_time|og:release_date)["'][^>]+content=["']([^"']+)["']/i);
    if (dateMatch) publishDate = dateMatch[1].trim();
    if (!publishDate) {
      const d2 = clean.match(/(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2})/);
      if (d2) publishDate = d2[1];
    }

    // 来源名
    let sourceName = "网络来源";
    const siteName = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
    if (siteName) sourceName = siteName[1].trim();
    else {
      try {
        const host = new URL(validUrl).hostname.replace(/^www\./, "");
        const domainMap: Record<string, string> = {
          "people.com.cn": "人民网",
          "xinhuanet.com": "新华网",
          "gmw.cn": "光明网",
          "cctv.com": "央视网",
          "ce.cn": "经济日报",
          "qstheory.cn": "求是网",
          "gxrb.com.cn": "广西日报",
          "ngzb.cn": "南国早报",
          "gxnews.com.cn": "广西新闻网",
        };
        for (const [k, v] of Object.entries(domainMap)) {
          if (host.includes(k)) { sourceName = v; break; }
        }
      } catch {}
    }

    // 正文 — 直接在 cleaned html 上搜所有 p 标签(避免嵌套 div 正则截断)
    const contentContainer = clean;

    const paragraphs: string[] = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let pMatch;
    while ((pMatch = pRegex.exec(contentContainer)) !== null) {
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

    // p 段落太少时,补充 div 内长文本
    if (paragraphs.length < 2) {
      const divRegex = /<div[^>]*>([\s\S]*?)<\/div>/gi;
      let dMatch;
      while ((dMatch = divRegex.exec(contentContainer)) !== null && paragraphs.length < 10) {
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
      return NextResponse.json(
        { error: "正文提取失败", detail: "无法提取有效正文(可能是反爬或需登录)" },
        { status: 422 },
      );
    }

    const content = paragraphs.join("\n\n");
    if (content.length < 50) {
      return NextResponse.json(
        { error: "正文过短", detail: "提取到的正文不足50字" },
        { status: 422 },
      );
    }

    // ---- 步骤3:存入数据库 ----
    const db = getDb();
    const articleId = genId();
    const now = new Date().toISOString();

    // 确保默认来源"网址抓取"存在(避免外键约束失败)
    db.prepare(
      "INSERT OR IGNORE INTO media_sources (id, name, type, url, crawler_type) VALUES (?, ?, ?, ?, ?)",
    ).run("url-fetch", "网址抓取", "national", "about:blank", "html");

    db.prepare(
      `INSERT INTO articles (id, title, author, source_id, source_name, publish_date, url, content, topic, word_count, tags, is_processed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', 0, ?, ?)`,
    ).run(
      articleId,
      title || "未命名文章",
      author || null,
      "url-fetch",
      sourceName,
      publishDate || now,
      validUrl,
      content,
      "governance", // 默认话题,后续 AI 拆解时会分类
      content.length,
      now,
      now,
    );

    // ---- 步骤4:调用 AI 拆解 ----
    const article: Article = {
      id: articleId,
      title: title || "未命名文章",
      author,
      sourceId: "url-fetch",
      sourceName,
      publishDate: publishDate || now,
      url: validUrl,
      content,
      topic: "governance",
      wordCount: content.length,
      tags: [],
      isProcessed: false,
      createdAt: now,
      updatedAt: now,
    };

    const resultText = await analyzeArticle(article);
    const analysisData = parseJSONSafe(resultText);

    // 存储
    const analysisId = genId();
    db.prepare(
      "INSERT INTO article_analyses (id, article_id, data) VALUES (?, ?, ?)",
    ).run(analysisId, articleId, JSON.stringify(analysisData));

    const summary =
      analysisData.logicalFramework?.thesis ||
      analysisData.goldenSentences?.[0]?.text ||
      "";
    db.prepare(
      "UPDATE articles SET is_processed = 1, summary = ?, updated_at = datetime('now') WHERE id = ?",
    ).run(summary, articleId);

    return NextResponse.json({
      success: true,
      articleId,
      article: { title, sourceName, url: validUrl, content, contentLength: content.length },
      analysis: analysisData,
    });
  } catch (e: any) {
    console.error("网址拆解失败:", e);
    return NextResponse.json(
      { error: "拆解失败", detail: e.message },
      { status: 500 },
    );
  }
}

/**
 * 数字报桌面URL → 移动端API URL 改写。
 * 桌面版(如 gxrb.gxrb.com.cn)是 Swiper SPA 无正文,
 * 移动端API端点返回完整文章HTML。
 */
function rewriteDigitalPaperUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // 广西日报/南国早报数字报(同系统)
    if (host === "gxrb.gxrb.com.cn" || host === "ngzb.gxrb.com.cn") {
      u.hostname = "ssw.gxrb.com.cn";
      u.pathname = "/json/interface/epaper/api.php";
      u.protocol = "https:";
    }

    return u.toString();
  } catch {
    return url;
  }
}
