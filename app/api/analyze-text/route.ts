// POST /api/analyze-text — 复制文本拆解
import { NextRequest, NextResponse } from "next/server";
import { getDb, genId } from "@/lib/db";
import { analyzeArticle } from "@/lib/ai";
import { parseJSONSafe } from "@/lib/json-extract";
import type { Article } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { title, content, sourceName } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length < 50) {
      return NextResponse.json(
        { error: "正文内容不足", detail: "请粘贴至少50字的文章正文" },
        { status: 400 },
      );
    }
    if (!title || typeof title !== "string" || title.trim().length < 2) {
      return NextResponse.json(
        { error: "标题缺失", detail: "请填写文章标题" },
        { status: 400 },
      );
    }

    const db = getDb();

    // 确保默认来源存在(外键约束)
    db.prepare(
      "INSERT OR IGNORE INTO media_sources (id, name, type, url, crawler_type) VALUES (?, ?, ?, ?, ?)",
    ).run("manual-input", "手动输入", "national", "about:blank", "html");

    const articleId = genId();
    const now = new Date().toISOString();
    const finalTitle = title.trim();
    const finalContent = content.trim();
    const finalSource = (sourceName || "手动输入").trim();

    // 插入文章
    db.prepare(
      `INSERT INTO articles (id, title, source_id, source_name, publish_date, url, content, topic, word_count, tags, is_processed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', 0, ?, ?)`,
    ).run(
      articleId,
      finalTitle,
      "manual-input",
      finalSource,
      now,
      `manual://${articleId}`,
      finalContent,
      "governance",
      finalContent.length,
      now,
      now,
    );

    // 调用 AI 拆解
    const article: Article = {
      id: articleId,
      title: finalTitle,
      sourceId: "manual-input",
      sourceName: finalSource,
      publishDate: now,
      url: `manual://${articleId}`,
      content: finalContent,
      topic: "governance",
      wordCount: finalContent.length,
      tags: [],
      isProcessed: false,
      createdAt: now,
      updatedAt: now,
    };

    const resultText = await analyzeArticle(article);

    // 用鲁棒方法解析 JSON
    const analysisData = parseJSONSafe(resultText);

    // 存储拆解结果
    const analysisId = genId();
    db.prepare(
      "INSERT INTO article_analyses (id, article_id, data) VALUES (?, ?, ?)",
    ).run(analysisId, articleId, JSON.stringify(analysisData));

    // 更新文章摘要
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
      title: finalTitle,
      contentLength: finalContent.length,
      analysis: analysisData,
    });
  } catch (e: any) {
    console.error("文本拆解失败:", e);
    return NextResponse.json(
      { error: "拆解失败", detail: e.message },
      { status: 500 },
    );
  }
}
