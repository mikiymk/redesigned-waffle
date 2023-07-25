import { WordToken } from "../rules/word-token";

import type { ObjectSet } from "../util/object-set";
import type { DirectorSetToken } from "@/lib/rules/define-rules";

/**
 * ２つのトークン集合が最初の１文字について互いに素かどうかを判定する。
 * @param left A
 * @param right B
 * @returns 互いに素なら `true`
 */
export const isDisjoint = (left: ObjectSet<DirectorSetToken>, right: ObjectSet<DirectorSetToken>): boolean => {
  const leftFirstChars = firstChars(left);
  const rightFirstChars = firstChars(right);

  // 左辺の各文字についてループ
  for (const [leftCharStart, leftCharEnd] of leftFirstChars) {
    // 右辺の文字にかぶるところがあるかチェックする

    // １つでも範囲が重なるところがあれば
    if (
      rightFirstChars.some(
        ([rightCharStart, rightCharEnd]) => !(leftCharEnd < rightCharStart || rightCharEnd < leftCharStart),
      )
    ) {
      // あったらfalseを返す
      return false;
    }
  }

  return true;
};

/**
 * トークンの１文字目のリストをあげる
 * @param tokens トークン集合
 * @returns それぞれのトークンの１文字目の範囲
 */
const firstChars = (tokens: ObjectSet<DirectorSetToken>): [number, number][] => {
  const firstChars: [number, number][] = [];

  for (const token of tokens) {
    if (token instanceof WordToken) {
      // eslint-disable-next-line unicorn/prefer-code-point
      const char = token.word.charCodeAt(0);
      firstChars.push([char, char]);
    }
  }

  firstChars.sort(([a], [b]) => a - b);

  return firstChars;
};
