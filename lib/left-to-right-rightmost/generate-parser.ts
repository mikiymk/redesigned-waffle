import { closure } from "./closure";
import { groupByNextToken } from "./group-next-token";
import { LR0ItemSet } from "./item-set";
import { getLR0Item } from "./lr0-item";
import { nextItem } from "./next-item";

import type { Syntax } from "../left-to-right-leftmost/define-rules";

export const generateParser = (syntax: Syntax) => {
  const firstRule = syntax[0];
  if (firstRule === undefined) {
    throw new Error("syntax needs 1 or more rules");
  }

  const firstItem = getLR0Item(firstRule);

  const itemSetList = [new LR0ItemSet([firstItem, ...closure(syntax, firstItem)])];

  for (const itemSet of itemSetList) {
    const groups = groupByNextToken(itemSet);

    for (const group of groups) {
      const newSet = new LR0ItemSet();

      for (const item of group) {
        const next = nextItem(item);
        if (next !== undefined) {
          newSet.add(next);
        }
      }
      itemSetList.push(newSet);
    }
  }

  return itemSetList;
};
