import { ObjectSet } from "../util/object-set";

import type { LR0Item } from "./lr0-item";
import type { LR0ItemToken, RuleName } from "@/lib/rules/define-rules";

/**
 * アイテムを次のトークンでグループ分けします。
 * @param items アイテムのリスト
 * @returns グループ分けされたアイテム集合のリスト
 */
export const groupByNextToken = (items: Iterable<LR0Item>): [LR0ItemToken, ObjectSet<LR0Item>][] => {
  const record: Record<RuleName, [LR0ItemToken, ObjectSet<LR0Item>]> = {};

  for (const item of items) {
    const token = item.nextToken();

    if (token === undefined) {
      // ドットの後ろにトークンがない状態は、空のルールから生まれる。
      // 空のルールはクロージャ操作で新しいアイテムを生まないはずなので、スキップできる。
      continue;
    }

    const set = record[token.toKeyString()]?.[1] ?? new ObjectSet<LR0Item>();
    set.add(item);
    record[token.toKeyString()] = [token, set];
  }

  return Object.values(record);
};
