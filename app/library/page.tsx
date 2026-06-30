import { redirect } from "next/navigation";

// 旧素材库已下线,重定向到个人素材库
export default function LibraryRedirect() {
  redirect("/my-library");
}
