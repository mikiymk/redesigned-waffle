import type { RuleName, Syntax } from "@/lib/rules/define-rules";

/**
 * 構文ルールリストからルールの名前を一覧します。
 * @param syntax 構文りすと
 * @returns ルールの名前の配列
 */
export const getRuleNames = <T>(syntax: Syntax<T>): RuleName[] => {
  const names = new Set<RuleName>();

  for (const { name } of syntax) {
    names.add(name);
  }

  return [...names];
};
