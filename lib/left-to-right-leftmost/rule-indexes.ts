import type { Syntax } from "@/lib/rules/define-rules";

/**
 * 指定したルール名のルール番号を探します。
 * @param syntax 構文ルールリスト
 * @param ruleName ルール名
 * @returns ルール名を持つルールの添字
 */
export const getRuleIndexes = (syntax: Syntax, ruleName: string): number[] => {
  const indexes = [];

  for (const [index, element] of syntax.entries()) {
    if (element[0] === ruleName) {
      indexes.push(index);
    }
  }

  return indexes;
};
