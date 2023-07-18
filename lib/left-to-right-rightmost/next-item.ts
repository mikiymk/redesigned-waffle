import { LR0ItemSet } from "./item-set";

import type { LR0Item } from "./lr0-item";

/**
 *
 * @param itemSet
 * @returns
 */
export const nextItemSet = (itemSet: LR0ItemSet): LR0ItemSet => {
  return new LR0ItemSet(
    [...itemSet].map((item) => nextItem(item)),
    // .filter((item): item is LR0Item => item !== undefined),
  );
};

/**
 *
 * @param item
 * @returns
 */
export const nextItem = (item: LR0Item): LR0Item | undefined => {
  return item.tokens[item.position] === undefined
    ? undefined
    : {
        name: item.name,
        tokens: item.tokens,
        position: item.position + 1,
      };
};
