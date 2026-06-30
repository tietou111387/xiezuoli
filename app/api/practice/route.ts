// POST /api/practice — 提交仿写，获取AI批改
import { NextRequest, NextResponse } from "next/server";
import { getDb, genId } from "@/lib/db";
import { evaluateWriting } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { promptTitle, topic, content, requirements } = await req.json();

    if (!content || !promptTitle) {
      return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
    }

    // 调用AI批改
    const resultText = await evaluateWriting(
      promptTitle,
      topic || "governance",
      content,
      requirements,
    );

    // 解析JSON
    let feedback: any;
    const jsonMatch = resultText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      feedback = JSON.parse(jsonMatch[1]);
    } else {
      feedback = JSON.parse(resultText);
    }

    // 保存记录
    const db = getDb();
    const recordId = genId();
    db.prepare(
      `INSERT INTO practice_records
       (id, user_id, prompt_title, topic, user_content, ai_feedback, score, mode, word_count)
       VALUES (?, 'anonymous', ?, ?, ?, ?, ?, 'free', ?)`,
    ).run(
      recordId,
      promptTitle,
      topic || "governance",
      content,
      JSON.stringify(feedback),
      feedback.overallScore || 0,
      content.length,
    );

    return NextResponse.json({
      success: true,
      recordId,
      feedback,
    });
  } catch (e: any) {
    console.error("批改失败:", e);
    return NextResponse.json(
      { error: "批改失败", detail: e.message },
      { status: 500 },
    );
  }
}
