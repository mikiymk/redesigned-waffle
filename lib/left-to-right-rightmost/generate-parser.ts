import { closure } from "./closure";
import { groupByNextToken } from "./group-next-token";
import { LR0ItemSet } from "./item-set";
import { LR0Item } from "./lr0-item";
import { nextItemSet } from "./next-item";

import type { LR0ItemToken, Syntax } from "@/lib/rules/define-rules";

/**
 * 構文ルールリストからアイテム集合のリストを作ります。
 * @param syntax 構文ルールリスト
 * @returns LR(0)状態遷移テーブル
 */
export const generateParser = (syntax: Syntax) => {
  const firstRule = syntax[0];
  if (firstRule === undefined) {
    throw new Error("syntax needs 1 or more rules");
  }

  const firstItem = new LR0Item(firstRule);

  const itemSetList = [generateItemSet(syntax, [firstItem])];

  for (const { kernels, additions, gotoMap } of itemSetList) {
    // アイテム集合をグループ分けする
    const groups = groupByNextToken(new LR0ItemSet([...kernels, ...additions]));

    // 各グループについて
    outer: for (const [token, itemSet] of groups) {
      const next = nextItemSet(itemSet);

      // もし既存のアイテム集合に同じものがあったら
      // 新しく追加しない
      for (const [index, { kernels }] of itemSetList.entries()) {
        if (kernels.equals(next)) {
          gotoMap.push([token, index]);
          continue outer;
        }
      }

      gotoMap.push([token, itemSetList.length]);
      itemSetList.push(generateItemSet(syntax, next));
    }
  }

  return itemSetList;
};

/**
 * 1つのアイテム集合を作ります。
 * @param syntax 構文ルールリスト
 * @param items LR(0)アイテムリスト
 * @returns 展開したアイテムリスト
 */
const generateItemSet = (
  syntax: Syntax,
  items: Iterable<LR0Item>,
): { kernels: LR0ItemSet; additions: LR0ItemSet; gotoMap: [LR0ItemToken, number][] } => {
  const additions = new LR0ItemSet();
  for (const item of items) {
    additions.append(closure(syntax, item));
  }

  return {
    kernels: new LR0ItemSet(items),
    additions,
    gotoMap: [],
  };
};
