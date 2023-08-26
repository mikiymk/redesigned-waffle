import { eof, equalsRule } from "@/lib/rules/define-rules";

import { DFA } from "../deterministic-finite-automaton/dfa";
import { ObjectMap } from "../util/object-map";
import { ObjectSet } from "../util/object-set";
import { primitiveToString } from "../util/primitive-to-string";
import { zip } from "../util/zip-array";

import { groupByNextToken } from "./group-next-symbol";
import { LR0Item } from "./lr0-item";
import { nextItemSet } from "./next-item";
import { ParseTableRow } from "./parse-table-row";

import type { ParseReader, Result } from "../reader/parse-reader";
import type { ReferenceSymbol } from "../rules/reference-symbol";
import type { MatchResult } from "./parse-table-row";
import type {
  DirectorSetSymbol,
  Grammar,
  LR0ItemSymbol,
  NonTermSymbol,
  RuleSymbol,
  TermSymbol,
} from "@/lib/rules/define-rules";

/**
 * 構文ルールリストからアイテム集合のリストを作ります。
 * @param grammar 構文ルールリスト
 * @returns LR(0)状態遷移テーブル
 */
export const generateParseTable = <T>(grammar: Grammar<T>): ParseTable<T> => {
  // 最初のルール
  // S → E $ であり、Sは他のいずれのルールでも右辺に登場しません。
  const firstRule = grammar[0];
  if (firstRule === undefined) {
    throw new Error("文法は１つ以上のルールが必要です。");
  }

  const firstItem = new LR0Item(firstRule, 0, [eof]);

  // DFA 初期状態
  const initialState = new ParseTableRow(grammar, [firstItem]);

  // DFA 状態集合
  const states = [initialState];
  // DFA 文字集合
  const symbols: LR0ItemSymbol[] = [];
  const symbolsSet = new ObjectSet<LR0ItemSymbol>();
  // DFA 遷移関数 状態 → 文字 → 状態
  const transition: Record<number, Record<number, number>> = {};
  // DFA 受理状態
  const acceptStates: number[] = [];

  for (const [index, row] of zip(states)) {
    const { kernels, additions, gotoMap } = row;
    const transitionState = transition[index] ?? {};
    transition[index] = transitionState;

    // アイテム集合をグループ分けする
    const groups = groupByNextToken(new ObjectSet<LR0Item<T>>([...kernels, ...additions]));

    // 各グループについて
    outer: for (const [symbol, itemSet] of groups) {
      let symbolId: number;
      // 登場するシンボルを集める
      if (symbolsSet.has(symbol)) {
        const symbolKey = symbol.toKeyString();
        symbolId = symbols.findIndex((value) => value.toKeyString() === symbolKey);
      } else {
        symbolId = symbols.length;
        symbols.push(symbol);
        symbolsSet.add(symbol);
      }

      const next = nextItemSet(itemSet);

      // もし既存のアイテム集合に同じものがあったら
      // 新しく追加しない
      for (const [index, { kernels }] of states.entries()) {
        if (kernels.equals(next)) {
          transitionState[symbolId] = index;
          gotoMap.push([symbol, index]);
          continue outer;
        }
      }

      const nextIndex = states.length;

      transitionState[symbolId] = nextIndex;
      gotoMap.push([symbol, nextIndex]);
      states.push(new ParseTableRow(grammar, next));
    }

    for (const item of [...kernels, ...additions]) {
      if (grammar[0] && equalsRule(item.rule, grammar[0])) {
        acceptStates.push(index);
      }
    }

    row.collectRow();
  }

  const dfa = new DFA(states, symbols, 0, transition, acceptStates);
  console.log(dfa.minimization());

  return new ParseTable(states);
};

/**
 *
 */
export class ParseTable<T> {
  reduce: [ObjectSet<DirectorSetSymbol>, number][][] = [];
  accept: [ObjectSet<DirectorSetSymbol>, number][][] = [];
  shift: [TermSymbol, number][][] = [];
  goto: [ReferenceSymbol, number][][] = [];

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
      for (const symbol of set) {
        if (symbol.matchFirstChar(pr)) {
          return ["accept"];
        }
      }
    }

    // reduceを調べる
    for (const [set, number] of this.reduce[state] ?? []) {
      for (const symbol of set) {
        if (symbol.matchFirstChar(pr)) {
          return ["reduce", number];
        }
      }
    }

    // shiftを調べる
    for (const [symbol, number] of this.shift[state] ?? []) {
      if (symbol.matchFirstChar(pr)) {
        return ["shift", number, symbol];
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
    for (const [symbol, newState] of this.goto[state] ?? []) {
      if (symbol.name === name) {
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

  /**
   * デバッグ出力
   */
  printDebug(): void {
    const termTokenSet = new ObjectSet<TermSymbol>();
    const nonTermTokenSet = new ObjectSet<NonTermSymbol>();

    for (const [_, reduce, accept, shift, goto] of zip(this.reduce, this.accept, this.shift, this.goto)) {
      for (const [set] of reduce) {
        termTokenSet.append(set.difference(new ObjectSet([eof])) as ObjectSet<TermSymbol>);
      }

      for (const [set] of accept) {
        termTokenSet.append(set.difference(new ObjectSet([eof])) as ObjectSet<TermSymbol>);
      }

      for (const [symbol] of shift) {
        termTokenSet.add(symbol);
      }

      for (const [symbol] of goto) {
        nonTermTokenSet.add(symbol);
      }
    }

    const termTokens = [...termTokenSet].sort((a, b) => {
      if (a.type < b.type) {
        return -1;
      }
      if (a.type > b.type) {
        return 1;
      }

      if (a.word === undefined) {
        return -1;
      }
      if (b.word === undefined) {
        return 1;
      }

      if (a.word < b.word) {
        return -1;
      }
      if (a.word > b.word) {
        return 1;
      }

      return 0;
    });

    let lineString = "| State |";
    let lineString1 = "| ----- |";
    for (const term of termTokens) {
      const termTitle = term.word ? `${term.type} ${term.word}` : `${term.type}`;
      lineString += ` ${termTitle} |`;
      lineString1 += ` ${"-".repeat(termTitle.length)} |`;
    }

    lineString += "   $ |";
    lineString1 += " --- |";

    for (const nonTerm of nonTermTokenSet) {
      const nonTermTitle = typeof nonTerm.name === "symbol" ? `Symbol(${nonTerm.name.description})` : nonTerm.name;
      lineString += ` ${nonTermTitle} |`;
      lineString1 += ` ${"-".repeat(nonTermTitle.length)} |`;
    }

    console.log(lineString);
    console.log(lineString1);

    for (const [index, reduce, accept, shift, goto] of zip(this.reduce, this.accept, this.shift, this.goto)) {
      const symbolMap = new ObjectMap<RuleSymbol, string[]>();

      for (const [set, n] of reduce) {
        for (const symbol of set) {
          const value = symbolMap.get(symbol) ?? [];
          value.push(`r ${n}`);
          symbolMap.set(symbol, value);
        }
      }

      for (const [set] of accept) {
        for (const symbol of set) {
          const value = symbolMap.get(symbol) ?? [];
          value.push("acc");
          symbolMap.set(symbol, value);
        }
      }

      for (const [symbol, n] of shift) {
        const value = symbolMap.get(symbol) ?? [];
        value.push(`s ${n}`);
        symbolMap.set(symbol, value);
      }

      for (const [symbol, n] of goto) {
        const value = symbolMap.get(symbol) ?? [];
        value.push(`g ${n}`);
        symbolMap.set(symbol, value);
      }

      lineString = `| ${index.toString().padStart(5, " ")} |`;

      for (const term of termTokens) {
        const termTitle = term.word ? `${term.type} ${term.word}` : `${term.type}`;
        const result = symbolMap.get(term);
        const termValue = (result?.join("<br>") ?? "").padEnd(termTitle.length, " ");

        lineString += ` ${termValue} |`;
      }

      lineString += ` ${symbolMap.get(eof)?.join("<br>") ?? "   "} |`;

      for (const nonTerm of nonTermTokenSet) {
        const nonTermTitle = typeof nonTerm.name === "symbol" ? `Symbol(${nonTerm.name.description})` : nonTerm.name;
        const result = symbolMap.get(nonTerm);
        const nonTermValue = (result?.join("<br>") ?? "").padEnd(nonTermTitle.length, " ");

        lineString += ` ${nonTermValue} |`;
      }

      console.log(lineString);
    }
  }
}
