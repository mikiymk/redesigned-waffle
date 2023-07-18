import { tokenToString } from "../left-to-right-leftmost/token-set";

import { LR0ItemSet } from "./item-set";

import type { LR0Item } from "./lr0-item";
import type { LR0ItemToken } from "@/lib/rules/define-rules";

/**
 * アイテムを次のトークンでグループ分けします。
 * @param items アイテムのリスト
 * @returns グループ分けされたアイテム集合のリスト
 */
export const groupByNextToken = (items: Iterable<LR0Item>): [LR0ItemToken, LR0ItemSet][] => {
  const record: Record<string, [LR0ItemToken, LR0ItemSet]> = {};

  for (const item of items) {
    const token = item.tokens[item.position];

    if (token === undefined) {
      // ドットの後ろにトークンがない状態は、空のルールから生まれる。
      // 空のルールはクロージャ操作で新しいアイテムを生まないはずなので、スキップできる。
      continue;
    }

    const set = record[tokenToString(token)]?.[1] ?? new LR0ItemSet();
    set.add(item);
    record[tokenToString(token)] = [token, set];
  }

  return Object.values(record);
};
