import type { RuleName, Syntax } from "@/lib/rules/define-rules";

/**
 * 指定したルール名のルール番号を探します。
 * @param syntax 構文ルールリスト
 * @param ruleName ルール名
 * @returns ルール名を持つルールの添字
 */
export const getRuleIndexesFromName = <T>(syntax: Syntax<T>, ruleName: RuleName): number[] => {
  const indexes = [];

  for (const [index, rule] of syntax.entries()) {
    if (rule.name === ruleName) {
      indexes.push(index);
    }
  }

  return indexes;
};
