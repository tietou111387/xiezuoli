// GET /api/articles/[id] — 文章详情
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const article = db
    .prepare(
      `SELECT a.*, aa.data as analysis_data
       FROM articles a
       LEFT JOIN article_analyses aa ON a.id = aa.article_id
       WHERE a.id = ?`,
    )
    .get(id) as any;

  if (!article) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  // 解析tags和analysis
  try {
    article.tags = JSON.parse(article.tags || "[]");
  } catch {
    article.tags = [];
  }
  if (article.analysis_data) {
    try {
      article.analysis = JSON.parse(article.analysis_data);
    } catch {
      article.analysis = null;
    }
  }
  delete article.analysis_data;

  return NextResponse.json(article);
}
