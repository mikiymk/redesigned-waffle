import { zip } from "../util/zip-array";

import type { Grammar, RuleName } from "@/lib/rules/define-rules";

/**
 * 指定したルール名のルール番号を探し、その番号のアイテムのリストを返します。
 * @param grammar 構文ルールリスト
 * @param ruleName ルール名
 * @param arrays 配列リスト
 * @yields ルール名を持つルールの添字と配列のアイテム
 */
export const eachRules = function* <T, const Arrays extends readonly (readonly unknown[])[]>(
  grammar: Grammar<T>,
  ruleName: RuleName,
  arrays: Arrays,
): Generator<[number, [...{ [K in keyof Arrays]: Arrays[K][number] }]], void, undefined> {
  for (const [index, rule, ...items] of zip(grammar, ...arrays)) {
    if (rule.name === ruleName) {
      yield [index, items];
    }
  }
};
