import { CharToken } from "../rules/char-token";
import { empty } from "../rules/define-rules";
import { EmptyToken } from "../rules/empty-token";
import { ReferenceToken } from "../rules/reference-token";
import { WordToken } from "../rules/word-token";
import { ObjectSet } from "../util/object-set";
import { zip } from "../util/zip-array";

import type { GrammarRules } from "./grammar-rules";
import type { Tokens } from "./tokens";
import type { FirstSetToken } from "../rules/define-rules";

/**
 *
 */
export class FirstSets {
  private readonly tokens: Tokens;
  private readonly rules: GrammarRules;
  readonly sets: ObjectSet<FirstSetToken>[];

  /**
   * 文法ルールリストからFirst集合リストを作成します。
   * @param tokens トークン辞書
   * @param rules ルール辞書
   */
  constructor(tokens: Tokens, rules: GrammarRules) {
    this.tokens = tokens;
    this.rules = rules;
    // ルールリストと同じ長さで文字集合リストを作る
    this.sets = this.rules.rules.map(() => new ObjectSet<FirstSetToken>());
    this.initialize();
  }

  /**
   * ルール番号からルールに対応したFirst集合を返す
   * @param index ルール番号
   * @returns First集合
   */
  get(index: number): ObjectSet<FirstSetToken> {
    const set = this.sets[index];

    if (set) return set;

    throw new RangeError("out of bounce");
  }

  /**
   * 初期化メソッド
   */
  private initialize() {
    for (;;) {
      let updated = false;
      // 各ルールについてループする
      for (const [_, set, rule] of zip(this.sets, this.rules.rules)) {
        const length = set.size;

        this.getFirstSet(set, rule.tokens);

        // 集合に変化があったらマーク
        if (length !== set.size) {
          updated = true;
        }
      }

      // 全てに変化がなかったら終了
      if (!updated) {
        break;
      }
    }
  }

  /**
   * トークン列の最初の文字集合を作る
   * @param set 集合オブジェクト
   * @param tokens 作るルールのトークン列
   */
  getFirstSet(set: ObjectSet<FirstSetToken>, tokens: number[]): void {
    // ルールから最初のトークンを取り出す
    for (const [index, tokenNumber] of tokens.entries()) {
      const token = this.tokens.get(tokenNumber);
      if (token instanceof WordToken || token instanceof CharToken) {
        // もし、文字なら、それを文字集合に追加する
        set.add(token);
      } else if (token instanceof EmptyToken) {
        if (tokens[index + 1] === undefined) {
          // もし、空かつその後にトークンがないなら、空を文字集合に追加する

          set.add(token);
        } else {
          // もし、空かつその後にトークンがあるなら、後ろのトークンを文字集合に追加する
          continue;
        }
      } else if (token instanceof ReferenceToken) {
        // もし、他のルールなら、そのルールの文字集合を文字集合に追加する
        for (const index of this.rules.ruleNameMap[token.name] ?? []) {
          set.append(this.sets[index] ?? []);
        }

        // 空トークンが入っているなら、次のトークンを追加する
        if (set.has(empty) && tokens[index + 1] !== undefined) {
          set.delete(empty);
          continue;
        }
      }
      return;
    }
  }

  /**
   * オブジェクトの情報を出力する
   * @param indent インデント数
   */
  debugPrint(indent: number = 0) {
    const indentSpaces = " ".repeat(indent);
    console.log(indentSpaces, "FirstSet:");
    for (const set of this.sets) {
      for (const _token of set) {
        // token.debugPrint(indent + 1);
      }
    }
  }
}
