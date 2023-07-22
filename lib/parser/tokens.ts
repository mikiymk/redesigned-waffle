import { EmptyToken } from "../rules/empty-token";
import { ReferenceToken } from "../rules/reference-token";
import { ObjectSet } from "../util/object-set";
import { primitiveToString } from "../util/primitive-to-string";

import type { HaveGrammar, HaveRules } from "./parse-builder";
import type { RuleName, Token } from "../rules/define-rules";

/**
 * トークンを番号管理する
 */
export class Tokens {
  readonly builder: HaveGrammar & HaveRules;
  readonly tokens: Token[];
  readonly tokenKeys: RuleName[];

  /**
   * 文法に使われているトークンを求める
   * @param builder 文法を持つビルダーオブジェクト
   */
  constructor(builder: HaveGrammar & HaveRules) {
    this.builder = builder;

    const set = new ObjectSet<Token>();

    for (const [_, tokens] of builder.augmentedGrammars) {
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

    throw new Error(`target token ${primitiveToString(targetKey)} is not in tokens.`);
  }

  /**
   * トークンが空になるかどうか判定する
   * @param token トークン番号またはトークン
   * @returns トークンが空になる可能性があるなら`true`
   */
  isEmpty(token: number | Token): boolean {
    token = typeof token === "number" ? this.get(token) : token;

    if (token instanceof EmptyToken) {
      return true;
    } else if (token instanceof ReferenceToken) {
      for (const ruleIndex of this.builder.rules.indexes(token.name)) {
        const rule = this.builder.rules.get(ruleIndex);

        if (this.isEmpty(rule.firstToken)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * オブジェクトの情報を出力する
   * @param indent インデント数
   */
  debugPrint(indent: number = 0) {
    const indentSpaces = " ".repeat(indent);
    console.log(indentSpaces, "Tokens:");
    for (const token of this.tokens) {
      token.debugPrint(indent + 1);
    }
  }
}
