import { EOF } from "../reader/peekable-iterator";
import { equalsRule } from "../rules/define-rules";
import { ReferenceToken } from "../rules/reference-token";
import { getFirstSetList } from "../token-set/first-set-list";
import { getFollowSetList } from "../token-set/follow-set-list";
import { primitiveToString } from "../util/primitive-to-string";

import { closure } from "./closure";
import { LR0ItemSet } from "./lr0-item-set";

import type { LR0Item } from "./lr0-item";
import type {
  DirectorSetToken,
  FollowSetToken,
  LR0ItemToken,
  NonTermToken,
  RuleName,
  Syntax,
  TermToken,
} from "../rules/define-rules";
import type { TokenSet } from "../token-set/token-set";

type MatchResult = ["reduce", number] | ["shift", number, TermToken] | ["accept"] | ["error"];

/**
 *
 */
export class ParseTableRow {
  readonly kernels: LR0ItemSet;
  readonly additions: LR0ItemSet;
  readonly gotoMap: [LR0ItemToken, number][] = [];

  readonly #syntax;

  #collected = false;
  #reduce: [TokenSet<DirectorSetToken>, number][] = [];
  #accept = false;
  #shift: [TermToken, number][] = [];
  #goto: [NonTermToken, number][] = [];

  /**
   * 1つのアイテム集合を作ります。
   * @param syntax 構文ルールリスト
   * @param items LR(0)アイテムリスト
   */
  constructor(syntax: Syntax, items: Iterable<LR0Item>) {
    this.kernels = new LR0ItemSet(items);
    this.additions = new LR0ItemSet();
    this.#syntax = syntax;

    for (const item of this.kernels) {
      this.additions.append(closure(syntax, item));
    }

    // このアイテム集合のフォロー集合を求める
    const itemSetRules = [...this.kernels, ...this.additions].map((item) => item.rule);
    const firstSet = getFirstSetList(itemSetRules);
    const followSet = getFollowSetList(itemSetRules, firstSet);
    const lookahead: Record<RuleName, TokenSet<FollowSetToken>> = {};
    for (const [index, rule] of itemSetRules.entries()) {
      const set = followSet[index];
      if (set) {
        lookahead[rule[0]] = set;
      }
    }

    // 各アイテムにフォロー集合のトークンを追加する
    for (const item of [...this.kernels, ...this.additions]) {
      const set = lookahead[item.rule[0]];
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
          throw new Error("item is not in grammar");
        }

        if (ruleNumber === 0) {
          // 初期状態の場合はaccept
          this.#accept = true;
        } else {
          // その他のルールではreduce
          const resolver = item.lookahead;
          if (resolver === undefined) {
            throw new Error("not match resolver set and syntax");
          }
          this.#reduce.push([resolver, ruleNumber]);
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
   * 次の文字を読み込んでアクションを返します
   * @param char 次の文字
   * @returns アクション
   */
  getMatch(char: string | EOF): MatchResult {
    if (!this.#collected) {
      throw new Error("not collected");
    }

    if (this.#accept && char === EOF) {
      return ["accept"];
    }

    // reduceを調べる
    for (const [set, number] of this.#reduce) {
      if (set.matchFirstChar(char)) {
        return ["reduce", number];
      }
    }

    // shiftを調べる
    for (const [token, number] of this.#shift) {
      if (token.matchFirstChar(char)) {
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
      `not goto ${primitiveToString(nonTermName)} in ${this.gotoMap
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
        console.log("   ", token.asString(), "→", number);
      }
    }
    if (this.#accept) {
      console.log("  accept:", this.#accept);
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
