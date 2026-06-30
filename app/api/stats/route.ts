// GET /api/stats — 学习统计
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();

  const totalArticles = (
    db.prepare("SELECT COUNT(*) as c FROM articles").get() as any
  ).c;

  const totalAnalyzed = (
    db.prepare("SELECT COUNT(*) as c FROM article_analyses").get() as any
  ).c;

  const practiceRows = db
    .prepare("SELECT COUNT(*) as c, AVG(score) as avg FROM practice_records")
    .get() as any;

  const recentPractice = db
    .prepare(
      "SELECT prompt_title, mode, score, word_count, created_at FROM practice_records ORDER BY created_at DESC LIMIT 10",
    )
    .all();

  return NextResponse.json({
    totalArticles,
    totalAnalyzed,
    totalPractice: practiceRows.c || 0,
    avgScore: Math.round(practiceRows.avg || 0),
    recentPractice,
  });
}
