import { ObjectSet } from "../util/object-set";

import type { AugmentedSyntax, Token } from "../rules/define-rules";

/**
 *
 */
export class Tokens {
  readonly tokens: Token[];
  readonly tokenKeys: string[];

  /**
   *
   * @param grammar 文法
   */
  constructor(grammar: AugmentedSyntax) {
    const set = new ObjectSet<Token>();

    for (const [_, tokens] of grammar) {
      set.append(tokens);
    }

    this.tokens = [...set];
    this.tokenKeys = this.tokens.map((token) => token.toKeyString());
  }

  /**
   * 番号からトークンを返す
   * @param index トークン番号
   * @returns トークン
   */
  get(index: number): Token {
    const token = this.tokens[index];

    if (token) {
      return token;
    }

    throw new Error(`index ${index} is not in tokens list.`);
  }

  /**
   * トークンの番号を返す
   * @param target 探しているトークン
   * @returns 見つかったらその番号
   * @throws 見つからなかったらエラー
   */
  indexOf(target: Token): number {
    const targetKey = target.toKeyString();
    for (const [index, key] of this.tokenKeys.entries()) {
      if (key === targetKey) {
        return index;
      }
    }

    throw new Error(`target token ${targetKey} is not in tokens.`);
  }

  /**
   * オブジェクトの情報を出力する
   * @param indent インデント数
   */
  debugPrint(indent: number = 0) {
    const indentSpaces = " ".repeat(indent);
    console.log(indentSpaces, "Tokens:");
    for (const _token of this.tokens) {
      // token.debugPrint(indent + 1);
    }
  }
}
