import { EOF } from "../core/reader";
import { ReferenceToken, equalsRule } from "../rules/define-rules";

import { closure } from "./closure";
import { LR0ItemSet } from "./item-set";

import type { LR0Item } from "./lr0-item";
import type { LR0ItemToken, Syntax } from "../rules/define-rules";

type MatchResult = ["reduce", number] | ["shift", number] | ["accept"] | ["error"];

/**
 *
 */
export class ParseTableRow {
  readonly kernels: LR0ItemSet;
  readonly additions: LR0ItemSet;
  readonly gotoMap: [LR0ItemToken, number][] = [];

  readonly #syntax;

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
  }

  /**
   * shift-reduce衝突またはreduce-reduce衝突があるか調べます
   * @returns 衝突があるなら `true`
   */
  isConflict(): boolean {
    // todo
    return true;
  }

  /**
   * 次の文字を読み込んでアクションを返します
   * @param char 次の文字
   * @returns アクション
   */
  getMatch(char: string | EOF): MatchResult {
    // reduceとacceptを調べる
    for (const item of [...this.kernels, ...this.additions]) {
      if (item.isLast()) {
        // アイテムが最後なら

        // ルール番号を調べる
        const ruleNumber = this.#syntax.findIndex((rule) => equalsRule(item.rule, rule));

        if (ruleNumber === -1) {
          throw new Error("item is not in grammar");
        }

        if (ruleNumber === 0 && char === EOF) {
          // 初期状態の場合はaccept
          return ["accept"];
        }

        // その他のルールではreduce
        return ["reduce", ruleNumber];
      }
    }

    // shiftを調べる
    for (const [token, newState] of this.gotoMap) {
      if (token instanceof ReferenceToken) {
        // shiftは終端記号のみ調べる
        continue;
      }

      if (token.matchFirstChar(char)) {
        return ["shift", newState];
      }
    }

    return ["error"];
  }

  /**
   * 非終端記号から移動する状態を返します
   * @param nonTermName 非終端記号
   * @returns 遷移先の状態番号
   */
  getGoto(nonTermName: string): number {
    for (const [token, newState] of this.gotoMap) {
      if (token instanceof ReferenceToken && token.name === nonTermName) {
        return newState;
      }
    }

    throw new Error(
      "not goto " + nonTermName + " in " + this.gotoMap.map(([t, n]) => `${t.toString()}→${n}`).join(", "),
    );
  }
}
