import type { Grammar, RuleName } from "@/lib/rules/define-rules";

/**
 * 構文ルールリストからルールの名前を一覧します。
 * @param grammar 構文りすと
 * @returns ルールの名前の配列
 */
export const getRuleNames = <T>(grammar: Grammar<T>): RuleName[] => {
  const names = new Set<RuleName>();

  for (const { name } of grammar) {
    names.add(name);
  }

  return [...names];
};
