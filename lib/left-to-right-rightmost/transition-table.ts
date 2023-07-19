import { getDirectorSetList } from "../token-set/director-set-list";
import { getFirstSetList } from "../token-set/first-set-list";
import { getFollowSetList } from "../token-set/follow-set-list";

import { groupByNextToken } from "./group-next-token";
import { LR0Item } from "./lr0-item";
import { LR0ItemSet } from "./lr0-item-set";
import { nextItemSet } from "./next-item";
import { ParseTableRow } from "./parse-table-row";

import type { Syntax } from "@/lib/rules/define-rules";

/**
 * 構文ルールリストからアイテム集合のリストを作ります。
 * @param syntax 構文ルールリスト
 * @returns LR(0)状態遷移テーブル
 */
export const generateParseTable = (syntax: Syntax) => {
  // 最初のルール
  // S → E $ であり、Sは他のいずれのルールでも右辺に登場しません。
  const firstRule = syntax[0];
  if (firstRule === undefined) {
    throw new Error("syntax needs 1 or more rules");
  }

  const firstSet = getFirstSetList(syntax);
  const followSet = getFollowSetList(syntax, firstSet);
  const lookaheadSet = getDirectorSetList(firstSet, followSet);

  console.log("# parse table");
  console.log("first set:");
  for (const set of firstSet) {
    console.log(" ", set.asString());
  }
  console.log("follow set:");
  for (const set of followSet) {
    console.log(" ", set.asString());
  }
  console.log("lookahead set:");
  for (const set of lookaheadSet) {
    console.log(" ", set.asString());
  }
  console.log();

  const firstItem = new LR0Item(firstRule);

  const itemSetList = [new ParseTableRow(syntax, [firstItem])];

  for (const row of itemSetList) {
    const { kernels, additions, gotoMap } = row;

    // アイテム集合をグループ分けする
    const groups = groupByNextToken(new LR0ItemSet([...kernels, ...additions]));

    // 各グループについて
    outer: for (const [token, itemSet] of groups) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
      itemSetList.push(new ParseTableRow(syntax, next));
    }

    row.collectRow(followSet);
  }

  return itemSetList;
};
