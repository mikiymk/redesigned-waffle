import { EmptyToken } from "../rules/empty-token";
import { ObjectSet } from "../util/object-set";
import { primitiveToString } from "../util/primitive-to-string";

import type { FollowSetToken, LR0ItemToken, Rule, SyntaxToken } from "@/lib/rules/define-rules";

/**
 *
 */
export class LR0Item {
  readonly rule;
  readonly position;
  readonly lookahead: ObjectSet<FollowSetToken>;

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
  constructor(rule: Rule, position = 0, lookahead: Iterable<FollowSetToken> = []) {
    this.rule = rule;
    this.position = position;
    this.lookahead = new ObjectSet(lookahead);
  }

  /**
   * 次のトークンを返します
   * @returns ドットの次のトークン
   */
  nextToken(): LR0ItemToken | undefined {
    return this.rule[1]
      .slice(this.position)
      .find((token): token is Exclude<SyntaxToken, EmptyToken> => !(token instanceof EmptyToken));
  }

  /**
   * 次のアイテムを返します
   * @returns ドットを１つ進めたLR(0)アイテム。最後だった場合は`undefined`
   */
  nextItem(): LR0Item | undefined {
    return this.isLast() ? undefined : new LR0Item(this.rule, this.position + 1, this.lookahead);
  }

  /**
   * このアイテムが最後かどうか判定します
   * @returns ドットの次のトークンがなければ`true`
   */
  isLast(): boolean {
    return this.nextToken() === undefined;
  }

  /**
   * トークンを文字列にする
   * @returns 文字列
   */
  toKeyString(): string {
    return `${primitiveToString(this.rule[0])} → ${this.rule[1]
      .slice(0, this.position)
      .map((value) => value.toKeyString())
      .join(" ")} . ${this.rule[1]
      .slice(this.position)
      .map((value) => value.toKeyString())
      .join(" ")}`;
  }

  /**
   * トークンを文字列にする
   * @returns 文字列
   */
  toString(): string {
    return `${primitiveToString(this.rule[0])} → [${[
      ...this.rule[1].slice(0, this.position).map((value) => value.toKeyString()),
      ".",
      ...this.rule[1].slice(this.position).map((value) => value.toKeyString()),
    ].join(" , ")}]; ${[...this.lookahead].map((token) => token.toKeyString()).join(" ")}`;
  }
}
