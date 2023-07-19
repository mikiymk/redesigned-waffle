import { EmptyToken } from "@/lib/rules/define-rules";

import type { LR0ItemToken, Rule, SyntaxToken } from "@/lib/rules/define-rules";

/**
 * 空文字トークン以外かどうか判定します
 * @param token トークン
 * @returns トークンが空文字トークンならfalse
 */
const isNotEmptyToken = (token: SyntaxToken): token is Exclude<SyntaxToken, EmptyToken> => {
  return !(token instanceof EmptyToken);
};

/**
 *
 */
export class LR0Item {
  readonly rule;
  readonly position;

  /**
   * 構文ルールから先頭にドットトークンを追加したLR(0)アイテムを作る
   * ```
   * E → E + B
   * ⇓
   * E → • E + B
   * ```
   * @param rule ルール
   * @param position ドットの位置
   */
  constructor(rule: Rule, position = 0) {
    this.rule = rule;
    this.position = position;
  }

  /**
   * 次のトークンを返します
   * @returns ドットの次のトークン
   */
  nextToken(): LR0ItemToken | undefined {
    return this.rule[1]
      .slice(this.position)
      .find((token): token is Exclude<SyntaxToken, EmptyToken> => isNotEmptyToken(token));
  }

  /**
   * 次のアイテムを返します
   * @returns ドットを１つ進めたLR(0)アイテム。最後だった場合は`undefined`
   */
  nextItem(): LR0Item | undefined {
    return this.isLast() ? undefined : new LR0Item(this.rule, this.position + 1);
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
    return `${this.rule[0]} → ${this.rule[1]
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
    return `${this.rule[0]} → [${[
      ...this.rule[1].slice(0, this.position).map((value) => value.toKeyString()),
      ".",
      ...this.rule[1].slice(this.position).map((value) => value.toKeyString()),
    ].join(" , ")}]`;
  }
}
