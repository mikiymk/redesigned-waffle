import { equalsRule } from "../rules/define-rules";
import { ReferenceToken } from "../rules/reference-token";
import { getFirstSetList } from "../token-set/first-set";
import { getFollowSetList } from "../token-set/follow-set";
import { ObjectSet } from "../util/object-set";
import { primitiveToString } from "../util/primitive-to-string";
import { zip } from "../util/zip-array";

import { closure } from "./closure";

import type { LR0Item } from "./lr0-item";
import type { ParseReader } from "../reader/parse-reader";
import type {
  DirectorSetToken,
  FollowSetToken,
  LR0ItemToken,
  NonTermToken,
  RuleName,
  Syntax,
  TermToken,
} from "../rules/define-rules";

export type MatchResult = ["reduce", number] | ["shift", number, TermToken] | ["accept"] | ["error"];

/**
 *
 */
export class ParseTableRow<T> {
  readonly kernels: ObjectSet<LR0Item<T>>;
  readonly additions: ObjectSet<LR0Item<T>>;
  readonly gotoMap: [LR0ItemToken, number][] = [];

  readonly #syntax;

  #collected = false;
  #reduce: [ObjectSet<DirectorSetToken>, number][] = [];
  #accept: [ObjectSet<DirectorSetToken>, number][] = [];
  #shift: [TermToken, number][] = [];
  #goto: [NonTermToken, number][] = [];

  /**
   * 1つのアイテム集合を作ります。
   * @param syntax 構文ルールリスト
   * @param items LR(0)アイテムリスト
   */
  constructor(syntax: Syntax<T>, items: Iterable<LR0Item<T>>) {
    this.kernels = new ObjectSet<LR0Item<T>>(items);
    this.additions = new ObjectSet<LR0Item<T>>();
    this.#syntax = syntax;

    for (const item of this.kernels) {
      this.additions.append(closure(syntax, item));
    }

    // このアイテム集合のフォロー集合を求める
    const itemSetRules = [...this.kernels, ...this.additions].map((item) => item.rule);
    const firstSet = getFirstSetList(itemSetRules);
    const followSet = getFollowSetList(itemSetRules, firstSet);
    const lookahead: Record<RuleName, ObjectSet<FollowSetToken>> = {};
    for (const [_, rule, set] of zip(itemSetRules, followSet)) {
      lookahead[rule.name] = set;
    }

    // 各アイテムにフォロー集合のトークンを追加する
    for (const item of [...this.kernels, ...this.additions]) {
      const set = lookahead[item.rule.name];
      if (set) item.lookahead.append(set);
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
        const ruleNumber = this.#syntax.findIndex((rule) => equalsRule(item.rule, rule));

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
    for (const [token, number] of this.gotoMap) {
      if (token instanceof ReferenceToken) {
        this.#goto.push([token, number]);
      } else {
        this.#shift.push([token, number]);
      }
    }

    this.#collected = true;
  }

  /**
   *
   * @returns Reduceリスト
   */
  reduce(): [ObjectSet<DirectorSetToken>, number][] {
    return this.#reduce;
  }

  /**
   *
   * @returns Acceptリスト
   */
  accept(): [ObjectSet<DirectorSetToken>, number][] {
    return this.#accept;
  }

  /**
   *
   * @returns Shiftリスト
   */
  shift(): [TermToken, number][] {
    return this.#shift;
  }

  /**
   *
   * @returns Gotoリスト
   */
  goto(): [NonTermToken, number][] {
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
      for (const token of set) {
        if (token.matchFirstChar(pr)) {
          return ["accept"];
        }
      }
    }

    // reduceを調べる
    for (const [set, number] of this.#reduce) {
      for (const token of set) {
        if (token.matchFirstChar(pr)) {
          return ["reduce", number];
        }
      }
    }

    // shiftを調べる
    for (const [token, number] of this.#shift) {
      if (token.matchFirstChar(pr)) {
        return ["shift", number, token];
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

    for (const [token, newState] of this.#goto) {
      if (token.name === nonTermName) {
        return newState;
      }
    }

    throw new Error(
      `ルール名:${primitiveToString(nonTermName)}はGotoテーブルに見つかりませんでした。 ${this.gotoMap
        .map(([t, n]) => `${t.toString()}→${n}`)
        .join(", ")}`,
    );
  }

  /**
   * デバッグ情報を表示します。
   */
  printDebugInfo() {
    console.log("table-row:");
    console.log(" items:");
    for (const item of this.kernels) {
      console.log("  ", item.toString());
    }
    for (const item of this.additions) {
      console.log("  ", item.toString());
    }

    if (this.#shift.length > 0) {
      console.log("  shift:");
      for (const [token, number] of this.#shift) {
        console.log("   ", token.toString(), "→", number);
      }
    }
    if (this.#goto.length > 0) {
      console.log("  goto:");
      for (const [token, number] of this.#goto) {
        console.log("   ", token.toString(), "→", number);
      }
    }
    if (this.#reduce.length > 0) {
      console.log("  reduce:");
      for (const [token, number] of this.#reduce) {
        console.log("   ", token.toKeyString(), "→", number);
      }
    }
    if (this.#accept.length > 0) {
      console.log("  accept:");
      for (const [token, number] of this.#accept) {
        console.log("   ", token.toKeyString(), "→", number);
      }
    }

    if (this.#reduce.length > 1) {
      console.log("  reduce-reduce");
    }
    if (this.#reduce.length > 0 && this.#shift.length > 0) {
      console.log("  shift-reduce");
    }

    console.log();
  }
}
