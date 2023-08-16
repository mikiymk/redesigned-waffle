import { eof } from "@/lib/rules/define-rules";

import { ObjectSet } from "../util/object-set";
import { primitiveToString } from "../util/primitive-to-string";

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
    throw new Error("文法は１つ以上のルールが必要です。");
  }

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
        `ルール名:${primitiveToString(name)}は状態: ${state} のGotoテーブルに見つかりませんでした。 ${(
          this.goto[state] ?? []
        )
          .map(([t, n]) => `${t.toString()}→${n}`)
          .join(", ")}`,
      ),
    ];
  }
}
