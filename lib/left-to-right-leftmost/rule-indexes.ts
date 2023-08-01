import { zip } from "../util/zip-array";

import type { RuleName, Syntax } from "@/lib/rules/define-rules";

/**
 * 指定したルール名のルール番号を探し、その番号のアイテムのリストを返します。
 * @param syntax 構文ルールリスト
 * @param ruleName ルール名
 * @param arrays 配列リスト
 * @returns ルール名を持つルールの添字
 */
export const eachRules = <T, const Arrays extends readonly (readonly unknown[])[]>(
  syntax: Syntax<T>,
  ruleName: RuleName,
  arrays: Arrays,
): [number, [...{ [K in keyof Arrays]: Arrays[K][number] }]][] => {
  const indexes: [number, [...{ [K in keyof Arrays]: Arrays[K][number] }]][] = [];

  for (const [index, rule, ...items] of zip(syntax, ...arrays)) {
    if (rule.name === ruleName) {
      indexes.push([index, items]);
    }
  }

  return indexes;
};
