import { tokenToString } from "../left-to-right-leftmost/token-set";

import { LR0ItemSet } from "./item-set";

import type { LR0Item } from "./lr0-item";

export const groupByNextToken = (items: LR0Item[]): Record<string, LR0ItemSet> => {
  const record: Record<string, LR0ItemSet> = {};

  for (const item of items) {
    const token = item.tokens[item.position];

    if (token === undefined) {
      // ドットの後ろにトークンがない状態は、空のルールから生まれる。
      // 空のルールはクロージャ操作で新しいアイテムを生まないはずなので、スキップできる。
      continue;
    }

    const set = record[tokenToString(token)] ?? new LR0ItemSet();
    set.add(item);
    record[tokenToString(token)] = set;
  }

  return record;
};
