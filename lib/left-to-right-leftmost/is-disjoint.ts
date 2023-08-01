import type { ObjectSet } from "../util/object-set";
import type { DirectorSetToken } from "@/lib/rules/define-rules";

/**
 * ２つのトークン集合が最初の１文字について互いに素かどうかを判定する。
 * @param left A
 * @param right B
 * @returns 互いに素なら `true`
 */
export const isDisjoint = (left: ObjectSet<DirectorSetToken>, right: ObjectSet<DirectorSetToken>): boolean => {
  // 左辺の各文字についてループ
  for (const leftToken of left) {
    // 右辺の文字にかぶるところがあるかチェックする

    // １つでも範囲が重なるところがあれば
    if (right.has(leftToken)) {
      // あったらfalseを返す
      return false;
    }
  }

  return true;
};
