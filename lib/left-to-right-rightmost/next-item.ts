import type { LR0Item } from "./lr0-item";

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
