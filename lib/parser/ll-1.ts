import { getMatchRuleIndex } from "../left-to-right-leftmost/get-match-rule";
import { eof, reference } from "../rules/define-rules";
import { EmptyToken } from "../rules/empty-token";
import { EOFToken } from "../rules/eof-token";
import { ReferenceToken } from "../rules/reference-token";
import { WordToken } from "../rules/word-token";

import type { Tree } from "./tree";
import type { ParseReader, Result } from "../reader/peekable-iterator";
import type { DirectorSetToken, Syntax, Token } from "../rules/define-rules";
import type { ObjectSet } from "../util/object-set";

/**
 * LLパーサー
 */
export class LLParser {
  grammar: Syntax;
  directorSetList: ObjectSet<DirectorSetToken>[];

  /**
   * LRパーサーを作成する
   * @param grammar 文法
   * @param directorSetList 構文解析表
   */
  constructor(grammar: Syntax, directorSetList: ObjectSet<DirectorSetToken>[]) {
    this.grammar = grammar;
    this.directorSetList = directorSetList;
  }

  /**
   * 文字列を読み込んで構文木を作成する
   * @param pr 読み込みオブジェクト
   * @returns 構文木オブジェクト
   */
  parse(pr: ParseReader): Result<Tree> {
    // パーサー

    // 構文スタック
    const stack: Token[] = [eof, reference("start")];

    // 出力リスト
    const output: (number | string)[] = [];

    // 入力に対してループする
    for (;;) {
      // スタックのトップ
      const token = stack.pop();

      console.log("stack:   ", stack);
      console.log("output:  ", output);
      console.log("token:   ", token);
      console.log();

      if (token === undefined) {
        return [false, new Error("invalid sequence")];
      } else if (token instanceof EOFToken) {
        // EOFなら読み込みを終了する
        if (token.matchFirstChar(pr)) {
          break;
        }

        return [false, new Error("leftover string")];
      } else if (token instanceof ReferenceToken) {
        // 非終端記号の場合
        const [ok, ruleIndex] = getMatchRuleIndex(this.grammar, this.directorSetList, token.name, pr);
        if (!ok) {
          return [false, ruleIndex];
        }

        // 破壊的メソッドの影響を与えないために新しい配列を作る
        const tokens = [...(this.grammar[ruleIndex]?.[1] ?? [])];

        // 構文スタックに逆順で追加する
        for (const token of tokens.reverse()) {
          stack.push(token);
        }

        output.push(ruleIndex);
      } else if (token instanceof WordToken) {
        // 文字列の場合
        const [ok, result] = token.read(pr);
        if (ok) {
          // 成功したら出力
          output.push(result);
        } else {
          return [false, result];
        }
      } else if (token instanceof EmptyToken) {
        continue;
      }
    }

    // アウトプット列から構文木を作る
    const tree: Tree[] = [];
    for (const ident of output.reverse()) {
      if (typeof ident === "number") {
        const tokens = this.grammar[ident]?.[1];

        if (tokens) {
          tree.push({
            index: ident,
            children: tree.splice(-tokens.length, tokens.length).reverse(),
          });
        }
      } else {
        tree.push(ident);
      }
    }

    return [true, tree[0] ?? ""];
  }
}
