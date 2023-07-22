import { eof, reference } from "@/lib/rules/define-rules";

import { peek, EOF, get } from "../core/reader";
import { CharToken } from "../rules/char-token";
import { EmptyToken } from "../rules/empty-token";
import { EOFToken } from "../rules/eof-token";
import { ReferenceToken } from "../rules/reference-token";
import { WordToken } from "../rules/word-token";
import { getDirectorSetList } from "../token-set/director-set-list";
import { getFirstSetList } from "../token-set/first-set-list";
import { getFollowSetList } from "../token-set/follow-set-list";
import { primitiveToString } from "../util/primitive-to-string";

import { getMatchRuleIndex } from "./get-match-rule";
import { isLLSyntax } from "./is-ll-syntax";

import type { ParseReader } from "../core/reader";
import type { Result } from "../util/parser";
import type { Syntax, Token } from "@/lib/rules/define-rules";

type Tree = string | { index: number; children: Tree[] };

/**
 * 構文ルールリストからLL(1)パーサーを作成します。
 * @param syntax 構文ルールリスト
 * @returns パーサー
 */
export const generateParser = (syntax: Syntax) => {
  const firstSetList = getFirstSetList(syntax);
  const followSetList = getFollowSetList(syntax, firstSetList);
  const directorSetList = getDirectorSetList(firstSetList, followSetList);

  const error = isLLSyntax(syntax, directorSetList);
  if (!error[0]) {
    throw error[1];
  }

  console.log("# generate parser");
  console.log("syntax:");
  for (const [name, tokens] of syntax) {
    console.log(" ", name, ...tokens.map((token) => token.toString()));
  }
  console.log("first set:");
  for (const set of firstSetList) {
    console.log(" ", set.asString());
  }
  console.log("follow set:");
  for (const set of followSetList) {
    console.log(" ", set.asString());
  }
  console.log("director set:");
  for (const set of directorSetList) {
    console.log(" ", set.asString());
  }
  console.log();

  // パーサー
  return (pr: ParseReader): Result<Tree> => {
    // 構文スタック
    const stack: Token[] = [eof, reference("start")];

    // 出力リスト
    const output: (number | string)[] = [];

    // 入力に対してループする
    for (;;) {
      // スタックのトップ
      const token = stack.pop();
      // 次の入力
      const peeked = peek(pr);

      console.log("stack:   ", stack);
      console.log("output:  ", output);
      console.log("token:   ", token);
      console.log("peeked:  ", peeked);
      console.log();

      // 文字コードに変換
      const peekedCode = peeked === EOF ? Number.NaN : peeked.codePointAt(0) ?? Number.NaN;

      if (token === undefined) {
        return [false, new Error("invalid sequence")];
      } else if (token instanceof EOFToken) {
        // EOFなら読み込みを終了する
        if (peeked === EOF) {
          break;
        }

        return [false, new Error("leftover string")];
      } else if (token instanceof ReferenceToken) {
        // 非終端記号の場合
        const [ok, ruleIndex] = getMatchRuleIndex(syntax, directorSetList, token.name, peekedCode);
        if (!ok) {
          return [false, new Error(`no rule ${primitiveToString(token.name)} matches first char ${peeked.toString()}`)];
        }

        // 破壊的メソッドの影響を与えないために新しい配列を作る
        const tokens = [...(syntax[ruleIndex]?.[1] ?? [])];

        // 構文スタックに逆順で追加する
        for (const token of tokens.reverse()) {
          stack.push(token);
        }

        output.push(ruleIndex);
      } else if (token instanceof WordToken) {
        // 文字列の場合

        const { word } = token;
        let nextChar = peeked;

        // 文字列の各文字をループ
        for (const char of word) {
          if (nextChar === char) {
            get(pr);
          } else if (nextChar === EOF) {
            return [false, new Error("expect " + word + " but reaches end")];
          } else {
            return [false, new Error("expect " + word + " but found " + nextChar)];
          }

          nextChar = peek(pr);
        }

        // 成功したら出力
        output.push(word);
      } else if (token instanceof CharToken) {
        // 文字

        const { min, max } = token;

        if (peeked !== EOF && min <= peekedCode && peekedCode <= max) {
          output.push(peeked);
        } else if (peeked === EOF) {
          return [false, new Error(`expect char ${min}..${max}but reaches end`)];
        } else {
          return [false, new Error(`expect char ${min}..${max}but found ${peeked}`)];
        }
      } else if (token instanceof EmptyToken) {
        continue;
      }
    }

    // アウトプット列から構文木を作る
    const tree: Tree[] = [];
    for (const ident of output.reverse()) {
      if (typeof ident === "number") {
        const tokens = syntax[ident]?.[1];

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
  };
};
