import { dot } from "../left-to-right-leftmost/define-rules";

import type { LR0ItemToken, Rule, SyntaxToken } from "../left-to-right-leftmost/define-rules";

export type LR0Item = [string, LR0ItemToken[]];

/**
 * 構文ルールからLR(0)アイテムを作る
 * ```
 *  E → E + B
 *    E → • E + B
 *    E → E • + B
 *    E → E + • B
 *    E → E + B •
 * ```
 * @param rule ルール
 * @returns LR(0)アイテムのリスト
 */
export const getLR0Item = (rule: Rule): LR0Item[] => {
  const ruleName = rule[0];
  const tokens: LR0ItemToken[] = rule[1].filter(
    (token): token is Exclude<SyntaxToken, ["epsilon"]> => token[0] !== "epsilon",
  );

  const items: LR0ItemToken[][] = [];
  for (let index = 0; index <= tokens.length; index++) {
    items.push(inserted(tokens, dot, index));
  }

  return items.map((item) => [ruleName, item]);
};

/**
 * 配列に新しい要素を挿入した新しい配列を作ります。
 * @param baseArray 元の配列
 * @param newItem 挿入する要素
 * @param index 挿入する場所
 * @returns 挿入された配列のコピー
 */
const inserted = <T>(baseArray: T[], newItem: T, index: number): T[] => {
  return [...baseArray.slice(0, index), newItem, ...baseArray.slice(index)];
};
