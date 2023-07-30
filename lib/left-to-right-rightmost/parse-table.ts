import { eof } from "@/lib/rules/define-rules";

import { getDirectorSetList } from "../token-set/director-set";
import { getFirstSetList } from "../token-set/first-set";
import { getFollowSetList } from "../token-set/follow-set";
import { ObjectSet } from "../util/object-set";
import { primitiveToString } from "../util/primitive-to-string";
import { zip } from "../util/zip-array";

import { groupByNextToken } from "./group-next-token";
import { LR0Item } from "./lr0-item";
import { nextItemSet } from "./next-item";
import { ParseTableRow } from "./parse-table-row";

import type { MatchResult } from "./parse-table-row";
import type { ParseReader, Result } from "../reader/parse-reader";
import type { ReferenceToken } from "../rules/reference-token";
import type { DirectorSetToken, Syntax, TermToken } from "@/lib/rules/define-rules";

/**
 * 構文ルールリストからアイテム集合のリストを作ります。
 * @param syntax 構文ルールリスト
 * @returns LR(0)状態遷移テーブル
 */
export const generateParseTable = <T>(syntax: Syntax<T>): ParseTable<T> => {
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
    console.log(" ", set.toKeyString());
  }
  console.log("follow set:");
  for (const set of followSet) {
    console.log(" ", set.toKeyString());
  }
  console.log("lookahead set:");
  for (const set of lookaheadSet) {
    console.log(" ", set.toKeyString());
  }
  console.log();

  const firstItem = new LR0Item(firstRule, 0, [eof]);

  const itemSetList = [new ParseTableRow(syntax, [firstItem])];

  for (const row of itemSetList) {
    const { kernels, additions, gotoMap } = row;

    // アイテム集合をグループ分けする
    const groups = groupByNextToken(new ObjectSet<LR0Item<T>>([...kernels, ...additions]));

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

    row.collectRow();
  }

  return new ParseTable(itemSetList);
};

/**
 *
 */
export class ParseTable<T> {
  reduce: [ObjectSet<DirectorSetToken>, number][][] = [];
  accept: [ObjectSet<DirectorSetToken>, number][][] = [];
  shift: [TermToken, number][][] = [];
  goto: [ReferenceToken, number][][] = [];

  /**
   *
   * @param rows 行の配列
   */
  constructor(rows: ParseTableRow<T>[]) {
    for (const row of rows) {
      this.reduce.push(row.reduce());
      this.accept.push(row.accept());
      this.shift.push(row.shift());
      this.goto.push(row.goto());
    }
  }

  /**
   *
   * @param state 状態
   * @param pr リーダー
   * @returns 構文解析表のマッチ結果
   */
  match(state: number, pr: ParseReader): MatchResult {
    // reduceを調べる
    for (const [set, _] of this.accept[state] ?? []) {
      for (const token of set) {
        if (token.matchFirstChar(pr)) {
          return ["accept"];
        }
      }
    }

    // reduceを調べる
    for (const [set, number] of this.reduce[state] ?? []) {
      for (const token of set) {
        if (token.matchFirstChar(pr)) {
          return ["reduce", number];
        }
      }
    }

    // shiftを調べる
    for (const [token, number] of this.shift[state] ?? []) {
      if (token.matchFirstChar(pr)) {
        return ["shift", number, token];
      }
    }

    return ["error"];
  }

  /**
   *
   * @param state 現在のReduce状態
   * @param name 読み込んだルール名
   * @returns Gotoが正常な場合、移動先の番号
   */
  gotoState(state: number, name: string): Result<number> {
    for (const [token, newState] of this.goto[state] ?? []) {
      if (token.name === name) {
        return [true, newState];
      }
    }

    return [
      false,
      new Error(
        `not goto ${primitiveToString(name)} in ${(this.goto[state] ?? [])
          .map(([t, n]) => `${t.toString()}→${n}`)
          .join(", ")}`,
      ),
    ];
  }

  /**
   * デバッグ用に表示します
   */
  printDebug(): void {
    for (const [index, shift, goto, accept, reduce] of zip(this.shift, this.goto, this.accept, this.reduce)) {
      console.log("table-row", index, ":");

      if (shift.length > 0) {
        console.log("  shift:");
        for (const [token, number] of shift) {
          console.log("   ", token.toString(), "→", number);
        }
      }

      if (goto.length > 0) {
        console.log("  goto:");
        for (const [token, number] of goto) {
          console.log("   ", token.toString(), "→", number);
        }
      }
      if (reduce.length > 0) {
        console.log("  reduce:");
        for (const [token, number] of reduce) {
          console.log("   ", token.toKeyString(), "→", number);
        }
      }
      if (accept.length > 0) {
        console.log("  accept:");
        for (const [token, number] of accept) {
          console.log("   ", token.toKeyString(), "→", number);
        }
      }

      console.log();
    }
  }
}
