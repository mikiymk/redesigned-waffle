import { closure } from "./closure";
import { groupByNextToken } from "./group-next-token";
import { LR0ItemSet } from "./item-set";
import { LR0Item, getLR0Item } from "./lr0-item";
import { nextItem, nextItemSet } from "./next-item";

import type { Syntax } from "../left-to-right-leftmost/define-rules";

/**
 *
 * @param syntax
 * @returns
 */
// eslint-disable-next-line import/no-unused-modules
export const generateParser = (syntax: Syntax) => {
  const firstRule = syntax[0];
  if (firstRule === undefined) {
    throw new Error("syntax needs 1 or more rules");
  }

  const firstItem = getLR0Item(firstRule);

  const itemSetList = [generateItemSet(syntax, [firstItem])];

  for (const { kernels, additions } of itemSetList) {
    // アイテム集合をグループ分けする
    const groups = groupByNextToken(new LR0ItemSet([...kernels, ...additions]));

    // 各グループについて
    outer: for (const [firstToken, itemSet] of groups) {
      // もし既存のアイテム集合に同じものがあったら
      // 新しく追加しない

      const next = nextItemSet(itemSet);

      for (const { kernels } of itemSetList) {
        if (kernels.equals(next)) {
          continue outer;
        }
      }

      itemSetList.push(generateItemSet(syntax, next));
    }
  }

  return itemSetList.map(({ kernels, additions }) => ({ kernels: [...kernels], additions: [...additions] }));
};

/**
 *
 * @param syntax
 * @param items
 * @returns
 */
const generateItemSet = (syntax: Syntax, items: Iterable<LR0Item>): { kernels: LR0ItemSet; additions: LR0ItemSet } => {
  const additions = new LR0ItemSet();
  for (const item of items) {
    additions.append(closure(syntax, item));
  }

  return {
    kernels: new LR0ItemSet(items),
    additions,
  };
};
