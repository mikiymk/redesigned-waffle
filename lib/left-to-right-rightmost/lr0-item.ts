import { EmptySymbol } from "../rules/empty-symbol";
import { ObjectSet } from "../util/object-set";
import { primitiveToString } from "../util/primitive-to-string";

import type { Rule } from "../rules/rule";
import type { FollowSetSymbol, LR0ItemSymbol, SyntaxSymbol } from "@/lib/rules/define-rules";

/**
 *
 */
export class LR0Item<T> {
  readonly rule;
  readonly position;
  readonly lookahead: ObjectSet<FollowSetSymbol>;

  /**
   * 構文ルールから先頭にドットトークンを追加したLR(0)アイテムを作る
   * ```
   * E → E + B
   * ⇓
   * E → • E + B
   * ```
   * @param rule ルール
   * @param position ドットの位置
   * @param lookahead 先読み集合
   */
  constructor(rule: Rule<T>, position = 0, lookahead: Iterable<FollowSetSymbol> = []) {
    this.rule = rule;
    this.position = position;
    this.lookahead = new ObjectSet(lookahead);
  }

  /**
   * 次のトークンを返します
   * @returns ドットの次のトークン
   */
  nextSymbol(): LR0ItemSymbol | undefined {
    return this.rule.symbols
      .slice(this.position)
      .find((symbol): symbol is Exclude<SyntaxSymbol, EmptySymbol> => !(symbol instanceof EmptySymbol));
  }

  /**
   * 次のアイテムを返します
   * @returns ドットを１つ進めたLR(0)アイテム。最後だった場合は`undefined`
   */
  nextItem(): LR0Item<T> | undefined {
    return this.isLast() ? undefined : new LR0Item(this.rule, this.position + 1, this.lookahead);
  }

  /**
   * このアイテムが最後かどうか判定します
   * @returns ドットの次のトークンがなければ`true`
   */
  isLast(): boolean {
    return this.nextSymbol() === undefined;
  }

  /**
   * トークンを文字列にする
   * @returns 文字列
   */
  toKeyString(): string {
    return `${primitiveToString(this.rule.name)} → ${this.rule.symbols
      .slice(0, this.position)
      .map((value) => value.toKeyString())
      .join(" ")} . ${this.rule.symbols
      .slice(this.position)
      .map((value) => value.toKeyString())
      .join(" ")} [${[...this.lookahead].map((value) => value.toKeyString()).join(" ")}]`;
  }

  /**
   * トークンを文字列にする
   * @returns 文字列
   */
  toString(): string {
    return `${primitiveToString(this.rule.name)} → [${[
      ...this.rule.symbols.slice(0, this.position).map((value) => value.toKeyString()),
      ".",
      ...this.rule.symbols.slice(this.position).map((value) => value.toKeyString()),
    ].join(" , ")}]; ${[...this.lookahead].map((symbol) => symbol.toKeyString()).join(" ")}`;
  }
}
