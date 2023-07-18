import type { Syntax } from "@/lib/rules/define-rules";

/**
 * 構文ルールリストからルールの名前を一覧します。
 * @param syntax 構文りすと
 * @returns ルールの名前の配列
 */
export const getRuleNames = (syntax: Syntax): string[] => {
  const names = new Set<string>();

  for (const [ruleName] of syntax) {
    names.add(ruleName);
  }

  return [...names];
};
