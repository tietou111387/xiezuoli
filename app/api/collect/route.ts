// POST /api/collect — 手动触发文章采集
import { NextResponse } from "next/server";
import { collectArticles } from "@/lib/crawler";

export async function POST() {
  try {
    const count = await collectArticles();
    return NextResponse.json({ success: true, collected: count });
  } catch (e: any) {
    return NextResponse.json(
      { error: "采集失败", detail: e.message },
      { status: 500 },
    );
  }
}
