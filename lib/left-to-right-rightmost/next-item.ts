import { ObjectSet } from "../util/object-set";

import type { LR0Item } from "./lr0-item";

/**
 * アイテム集合からドットを進めたアイテム集合を作ります。
 * @param itemSet アイテム集合
 * @returns ドットを進めたアイテム集合
 */
export const nextItemSet = (itemSet: ObjectSet<LR0Item>): ObjectSet<LR0Item> => {
  return new ObjectSet<LR0Item>(
    [...itemSet].map((item) => item.nextItem()).filter((item): item is LR0Item => item !== undefined),
  );
};
