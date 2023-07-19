import { closure } from "./closure";
import { LR0ItemSet } from "./item-set";

import type { LR0Item } from "./lr0-item";
import type { EOF } from "../core/reader";
import type { LR0ItemToken, Syntax } from "../rules/define-rules";

type MatchResult = ["reduce", number] | ["shift", number] | ["accept"];

/**
 *
 */
export class ParseTableRow {
  readonly kernels: LR0ItemSet;
  readonly additions: LR0ItemSet;
  readonly gotoMap: [LR0ItemToken, number][] = [];

  /**
   * 1つのアイテム集合を作ります。
   * @param syntax 構文ルールリスト
   * @param items LR(0)アイテムリスト
   */
  constructor(syntax: Syntax, items: Iterable<LR0Item>) {
    this.kernels = new LR0ItemSet(items);
    this.additions = new LR0ItemSet();

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
    // todo
    return ["accept"];
  }

  /**
   * 非終端記号から移動する状態を返します
   * @param nonTermName 非終端記号
   * @returns 遷移先の状態番号
   */
  getGoto(nonTermName: string): number {
    // todo
    return 0;
  }
}
