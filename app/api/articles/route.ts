// GET /api/articles — 文章列表（支持筛选、搜索、分页）
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);

  const topic = searchParams.get("topic");
  const province = searchParams.get("province");
  const keyword = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (topic) {
    where += " AND topic = ?";
    params.push(topic);
  }
  if (province) {
    where += " AND province = ?";
    params.push(province);
  }
  if (keyword) {
    where += " AND (title LIKE ? OR content LIKE ?)";
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  const countRow = db
    .prepare(`SELECT COUNT(*) as total FROM articles ${where}`)
    .get(...params) as { total: number };

  const rows = db
    .prepare(
      `SELECT id, title, source_name, topic, province, city, publish_date, summary, word_count, tags, is_processed
       FROM articles ${where}
       ORDER BY publish_date DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset);

  return NextResponse.json({
    articles: rows,
    total: countRow.total,
    page,
    limit,
    totalPages: Math.ceil(countRow.total / limit),
  });
}
