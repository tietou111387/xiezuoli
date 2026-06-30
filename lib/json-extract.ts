// ============================================================
// 鲁棒 JSON 提取+修复器 v3 — 处理 AI 返回的各种非标准 JSON
// 策略:状态机遍历,在字符串值内转义所有控制字符和未转义双引号
// ============================================================

/**
 * 从 AI 返回文本中提取 JSON 字符串
 */
export function extractJSON(text: string): string {
  if (!text || typeof text !== "string") {
    throw new Error("输入为空");
  }

  // 策略1:```json 代码块
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    const candidate = codeBlockMatch[1].trim();
    if (candidate.startsWith("{") || candidate.startsWith("[")) {
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        // 继续到修复阶段
      }
    }
  }

  // 策略2:第一个 '{' 到最后一个 '}'
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text.trim();
}

/**
 * 修复 AI 返回的非标准 JSON
 */
export function repairJSON(input: string): string {
  // 1. 预处理
  let text = input;
  text = text.replace(/^\uFEFF/, "");                              // BOM
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, ""); // 代码块标记
  text = text.replace(/\/\/[^\n\r]*/g, "");                        // 单行注释
  text = text.replace(/\/\*[\s\S]*?\*\//g, "");                    // 多行注释
  text = text.replace(/,(\s*[}\]])/g, "$1");                       // 尾随逗号

  // 2. 移除控制字符,但保留换行 \n
  // ponytail: 字符串值内的字面 \n 由状态机转义为 \\n(保留内容);
  // 其他控制字符(\r\t 等)JSON 不允许,直接删除。
  // 旧实现连 \n 一起删,会把多行字符串值粘连丢内容。
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").replace(/\r\n?/g, "\n");

  // 3. 状态机:修复字符串值内的未转义双引号
  let result = "";
  let i = 0;
  let inString = false;

  while (i < text.length) {
    const ch = text[i];

    if (!inString) {
      if (ch === '"') {
        inString = true;
        result += ch;
        i++;
      } else {
        result += ch;
        i++;
      }
    } else {
      // 在字符串值内
      if (ch === "\\") {
        // 转义序列,原样保留
        result += ch + (text[i + 1] || "");
        i += 2;
      } else if (ch === '"') {
        // 判断是字符串结束还是值内的未转义引号
        const rest = text.slice(i + 1).replace(/^\s*/, "");
        if (
          rest.startsWith(",") ||
          rest.startsWith("}") ||
          rest.startsWith("]") ||
          rest.startsWith(":") ||
          rest === ""
        ) {
          // 字符串结束
          inString = false;
          result += ch;
          i++;
        } else {
          // 值内的未转义双引号 → 替换为「,保持 inString 状态继续
          result += "「";
          i++;
        }
      } else if (ch === "\n") {
        // 字符串值内的字面换行 → 转义,避免 Bad control character
        result += "\\n";
        i++;
      } else if (ch === "\t") {
        // 字符串值内的字面制表符 → 转义
        result += "\\t";
        i++;
      } else {
        result += ch;
        i++;
      }
    }
  }

  // 4. 统一中文引号
  result = result.replace(/\u201C/g, "「").replace(/\u201D/g, "」");

  // 5. 修复单引号字符串值
  result = result.replace(/:\s*'([^']*)'/g, ': "$1"');

  // 6. 再次清理尾随逗号
  result = result.replace(/,(\s*[}\]])/g, "$1");

  return result.trim();
}

/**
 * 安全解析 JSON
 */
export function parseJSONSafe(text: string): any {
  // 第一次尝试:直接提取+parse
  const extracted = extractJSON(text);
  try {
    return JSON.parse(extracted);
  } catch {}

  // 第二次:repair 后 parse
  const repaired = repairJSON(extracted);
  try {
    return JSON.parse(repaired);
  } catch (e1: any) {
    // 第三次:更激进的 repair
    const aggressive = aggressiveRepair(repaired);
    try {
      return JSON.parse(aggressive);
    } catch (e2: any) {
      // 第四次:截断兜底 — 自动补全未闭合的括号和引号
      const closed = autoClose(aggressive);
      try {
        return JSON.parse(closed);
      } catch (e3: any) {
        throw new Error(
          `JSON解析失败: ${e1.message}\n修复后仍失败: ${e2.message}\n提取内容前300字符: ${repaired.slice(0, 300)}`
        );
      }
    }
  }
}

/**
 * 截断兜底 — 自动补全未闭合的括号和引号。
 * ponytail: AI 输出 hit max_tokens 时 JSON 在中途截断,
 * 补闭合符让剩余部分合法可解析,比直接抛错好。
 * 升级路径:改用 streaming + chunked JSON 解析彻底解决。
 */
function autoClose(text: string): string {
  let result = text;

  // 1. 闭合未结束的字符串值(末尾奇数个未转义引号 → 补一个)
  let inStr = false;
  let lastStrEnd = -1;
  for (let i = 0; i < result.length; i++) {
    if (result[i] === "\\") { i++; continue; }
    if (result[i] === '"') {
      if (!inStr) { inStr = true; lastStrEnd = -1; }
      else { inStr = false; lastStrEnd = i; }
    }
  }
  if (inStr && lastStrEnd < result.length - 1) {
    result += '"';
  }

  // 2. 补全未闭合的括号: ] → } → ]
  let depth = 0;
  const stack: string[] = [];
  for (const ch of result) {
    if (ch === "{") { depth++; stack.push("}"); }
    else if (ch === "[") { depth++; stack.push("]"); }
    else if (ch === "}" || ch === "]") {
      if (stack.length > 0 && stack[stack.length - 1] === ch) {
        depth--;
        stack.pop();
      }
    }
  }
  // 栈中剩余的是未闭合的括号,逆序补上
  while (stack.length > 0) {
    result += stack.pop()!;
  }

  return result;
}

/**
 * 激进修复 — 最后手段
 */
function aggressiveRepair(text: string): string {
  let result = text;

  // 把所有中文引号统一
  result = result.replace(/\u201C/g, "「").replace(/\u201D/g, "」");

  // 移除所有尾随逗号
  result = result.replace(/,(\s*[}\]])/g, "$1");

  // 把字符串值内的所有英文双引号替换为「」
  // 用状态机:在字符串值内,把所有非结束的 " 替换为「」
  let out = "";
  let inStr = false;
  let i = 0;
  while (i < result.length) {
    const ch = result[i];
    if (!inStr) {
      if (ch === '"') { inStr = true; out += ch; }
      else out += ch;
      i++;
    } else {
      if (ch === "\\") {
        out += ch + (result[i + 1] || "");
        i += 2;
      } else if (ch === '"') {
        const rest = result.slice(i + 1).replace(/^\s*/, "");
        if (rest.startsWith(",") || rest.startsWith("}") || rest.startsWith("]") || rest.startsWith(":") || rest === "") {
          inStr = false;
          out += ch;
          i++;
        } else {
          // 未转义引号 → 「
          out += "「";
          i++;
        }
      } else {
        out += ch;
        i++;
      }
    }
  }

  return out;
}
