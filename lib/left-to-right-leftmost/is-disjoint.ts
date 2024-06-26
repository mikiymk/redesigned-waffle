import type { DirectorSetSymbol } from "@/lib/rules/define-rules";
import type { ObjectSet } from "../util/object-set";

/**
 * ２つのトークン集合が最初の１文字について互いに素かどうかを判定する。
 * @param left A
 * @param right B
 * @returns 互いに素なら `true`
 */
export const isDisjoint = (left: ObjectSet<DirectorSetSymbol>, right: ObjectSet<DirectorSetSymbol>): boolean => {
  // 左辺の各文字についてループ
  for (const leftSymbol of left) {
    // 右辺の文字にかぶるところがあるかチェックする

    // １つでも範囲が重なるところがあれば
    if (right.has(leftSymbol)) {
      // あったらfalseを返す
      return false;
    }
  }

  return true;
};
