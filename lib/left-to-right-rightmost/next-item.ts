import { LR0ItemSet } from "./item-set";

import type { LR0Item } from "./lr0-item";

/**
 * アイテム集合からドットを進めたアイテム集合を作ります。
 * @param itemSet アイテム集合
 * @returns ドットを進めたアイテム集合
 */
export const nextItemSet = (itemSet: LR0ItemSet): LR0ItemSet => {
  return new LR0ItemSet(
    [...itemSet].map((item) => item.nextItem()).filter((item): item is LR0Item => item !== undefined),
  );
};
