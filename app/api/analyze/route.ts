// POST /api/analyze — 触发文章AI拆解
import { NextRequest, NextResponse } from "next/server";
import { getDb, genId } from "@/lib/db";
import { analyzeArticle } from "@/lib/ai";
import { parseJSONSafe } from "@/lib/json-extract";

export async function POST(req: NextRequest) {
  try {
    const { articleId } = await req.json();
    if (!articleId) {
      return NextResponse.json({ error: "缺少articleId" }, { status: 400 });
    }

    const db = getDb();
    const article = db
      .prepare("SELECT * FROM articles WHERE id = ?")
      .get(articleId) as any;

    if (!article) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }

    // 检查是否已拆解
    const existing = db
      .prepare("SELECT * FROM article_analyses WHERE article_id = ?")
      .get(articleId);

    if (existing) {
      return NextResponse.json({
        message: "已拆解",
        analysis: JSON.parse((existing as any).data),
      });
    }

    // 调用AI拆解
    const resultText = await analyzeArticle(article);

    // 用鲁棒方法解析 JSON
    const analysisData = parseJSONSafe(resultText);

    // 存储
    const analysisId = genId();
    db.prepare(
      "INSERT INTO article_analyses (id, article_id, data) VALUES (?, ?, ?)",
    ).run(analysisId, articleId, JSON.stringify(analysisData));

    // 标记已处理并更新摘要
    const summary =
      analysisData.logicalFramework?.thesis ||
      analysisData.goldenSentences?.[0]?.text ||
      "";
    db.prepare(
      "UPDATE articles SET is_processed = 1, summary = ?, updated_at = datetime('now') WHERE id = ?",
    ).run(summary, articleId);

    return NextResponse.json({ success: true, analysis: analysisData });
  } catch (e: any) {
    console.error("AI分析失败:", e);
    return NextResponse.json(
      { error: "AI分析失败", detail: e.message },
      { status: 500 },
    );
  }
}
