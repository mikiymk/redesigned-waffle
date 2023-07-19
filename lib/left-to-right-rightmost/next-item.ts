import { LR0ItemSet } from "./item-set";

import type { LR0Item } from "./lr0-item";

/**
 * アイテム集合からドットを進めたアイテム集合を作ります。
 * @param itemSet アイテム集合
 * @returns ドットを進めたアイテム集合
 */
export const nextItemSet = (itemSet: LR0ItemSet): LR0ItemSet => {
  return new LR0ItemSet(
    [...itemSet].map((item) => nextItem(item)).filter((item): item is LR0Item => item !== undefined),
  );
};

/**
 * 次のアイテムを返します
 * @param item LR(0)アイテム
 * @returns ドットを１つ進めたLR(0)アイテム。最後だった場合は`undefined`
 */
const nextItem = (item: LR0Item): LR0Item | undefined => {
  return item.tokens[item.position] === undefined
    ? undefined
    : {
        name: item.name,
        tokens: item.tokens,
        position: item.position + 1,
      };
};
