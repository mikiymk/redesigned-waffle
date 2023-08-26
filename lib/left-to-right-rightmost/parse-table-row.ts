import { equalsRule } from "../rules/define-rules";
import { ReferenceSymbol } from "../rules/reference-symbol";
import { getFirstSetList } from "../symbol-set/first-set";
import { getFollowSetList } from "../symbol-set/follow-set";
import { ObjectSet } from "../util/object-set";
import { primitiveToString } from "../util/primitive-to-string";
import { zip } from "../util/zip-array";

import { closure } from "./closure";

import type { ParseReader } from "../reader/parse-reader";
import type {
  DirectorSetSymbol,
  FollowSetSymbol,
  LR0ItemSymbol,
  NonTermSymbol,
  RuleName,
  Grammar,
  TermSymbol,
} from "../rules/define-rules";
import type { LR0Item } from "./lr0-item";

export type MatchResult = ["reduce", number] | ["shift", number, TermSymbol] | ["accept"] | ["error"];

/**
 *
 */
export class ParseTableRow<T> {
  readonly kernels: ObjectSet<LR0Item<T>>;
  readonly additions: ObjectSet<LR0Item<T>>;
  readonly gotoMap: [LR0ItemSymbol, number][] = [];

  readonly #grammar;

  #collected = false;
  #reduce: [ObjectSet<DirectorSetSymbol>, number][] = [];
  #accept: [ObjectSet<DirectorSetSymbol>, number][] = [];
  #shift: [TermSymbol, number][] = [];
  #goto: [NonTermSymbol, number][] = [];

  /**
   * 1つのアイテム集合を作ります。
   * @param grammar 構文ルールリスト
   * @param items LR(0)アイテムリスト
   */
  constructor(grammar: Grammar<T>, items: Iterable<LR0Item<T>>) {
    this.kernels = new ObjectSet<LR0Item<T>>(items);
    this.additions = new ObjectSet<LR0Item<T>>();
    this.#grammar = grammar;

    for (const item of this.kernels) {
      this.additions.append(closure(grammar, item));
    }

    // このアイテム集合のフォロー集合を求める
    const itemSetRules = [...this.kernels, ...this.additions].map((item) => item.rule);
    const firstSet = getFirstSetList(itemSetRules);
    const followSet = getFollowSetList(itemSetRules, firstSet);
    const lookahead: Record<RuleName, ObjectSet<FollowSetSymbol>> = {};
    for (const [_, rule, set] of zip(itemSetRules, followSet)) {
      lookahead[rule.name] = set;
    }

    // 各アイテムにフォロー集合のトークンを追加する
    for (const item of [...this.kernels, ...this.additions]) {
      const set = lookahead[item.rule.name];
      if (set) {
        item.lookahead.append(set);
      }
    }
  }

  /**
   * shift, reduce, gotoなどを計算します。
   */
  collectRow() {
    // reduceとacceptを調べる
    for (const item of [...this.kernels, ...this.additions]) {
      if (item.isLast()) {
        // アイテムが最後なら

        // ルール番号を調べる
        const ruleNumber = this.#grammar.findIndex((rule) => equalsRule(item.rule, rule));

        if (ruleNumber === -1) {
          throw new Error(`ルール[${item.rule.toString()}]は文法の中にありません。`);
        }

        if (ruleNumber === 0) {
          // 初期状態の場合はaccept
          this.#accept.push([item.lookahead, ruleNumber]);
        } else {
          // その他のルールではreduce
          this.#reduce.push([item.lookahead, ruleNumber]);
        }
      }
    }

    // shiftを調べる
    for (const [symbol, number] of this.gotoMap) {
      if (symbol instanceof ReferenceSymbol) {
        this.#goto.push([symbol, number]);
      } else {
        this.#shift.push([symbol, number]);
      }
    }

    this.#collected = true;
  }

  /**
   *
   * @returns Reduceリスト
   */
  reduce(): [ObjectSet<DirectorSetSymbol>, number][] {
    return this.#reduce;
  }

  /**
   *
   * @returns Acceptリスト
   */
  accept(): [ObjectSet<DirectorSetSymbol>, number][] {
    return this.#accept;
  }

  /**
   *
   * @returns Shiftリスト
   */
  shift(): [TermSymbol, number][] {
    return this.#shift;
  }

  /**
   *
   * @returns Gotoリスト
   */
  goto(): [NonTermSymbol, number][] {
    return this.#goto;
  }

  /**
   * 次の文字を読み込んでアクションを返します
   * @param pr 次の文字
   * @returns アクション
   */
  getMatch(pr: ParseReader): MatchResult {
    if (!this.#collected) {
      throw new Error("not collected");
    }

    for (const [set, _] of this.#accept) {
      for (const symbol of set) {
        if (symbol.matchFirstChar(pr)) {
          return ["accept"];
        }
      }
    }

    // reduceを調べる
    for (const [set, number] of this.#reduce) {
      for (const symbol of set) {
        if (symbol.matchFirstChar(pr)) {
          return ["reduce", number];
        }
      }
    }

    // shiftを調べる
    for (const [symbol, number] of this.#shift) {
      if (symbol.matchFirstChar(pr)) {
        return ["shift", number, symbol];
      }
    }

    return ["error"];
  }

  /**
   * 非終端記号から移動する状態を返します
   * @param nonTermName 非終端記号
   * @returns 遷移先の状態番号
   */
  getGoto(nonTermName: RuleName): number {
    if (!this.#collected) {
      throw new Error("not collected");
    }

    for (const [symbol, newState] of this.#goto) {
      if (symbol.name === nonTermName) {
        return newState;
      }
    }

    throw new Error(
      `ルール名:${primitiveToString(nonTermName)}はGotoテーブルに見つかりませんでした。 ${this.gotoMap
        .map(([t, n]) => `${t.toString()}→${n}`)
        .join(", ")}`,
    );
  }
}
