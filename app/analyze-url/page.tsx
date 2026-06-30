import { redirect } from "next/navigation";

// 网址拆解已下线,重定向到文本拆解
export default function AnalyzeUrlRedirect() {
  redirect("/analyze-text");
}
