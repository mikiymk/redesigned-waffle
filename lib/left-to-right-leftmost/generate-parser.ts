import { eof, reference } from "@/lib/rules/define-rules";

import { peek, EOF, get } from "../core/reader";

import { getDirectorSetList } from "./director-set";
import { getFirstSetList } from "./first-set";
import { getFollowSetList } from "./follow-set";
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

  console.log("syntax:        ", syntax);
  console.log("first set:     ", firstSetList);
  console.log("follow set:    ", followSetList);
  console.log("director set:  ", directorSetList);
  console.log();

  // パーサー
  return (pr: ParseReader): Result<Tree> => {
    // 構文スタック
    const stack: Token[] = [eof, reference("start")];

    // 出力リスト
    const output: (number | string)[] = [];

    // 入力に対してループする
    loop: for (;;) {
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
      }

      switch (token[0]) {
        case "eof": {
          // EOFなら読み込みを終了する
          if (peeked === EOF) {
            break loop;
          }

          return [false, new Error("leftover string")];
        }

        case "ref": {
          // 非終端記号の場合
          const [ok, ruleIndex] = getMatchRuleIndex(syntax, directorSetList, token[1], peekedCode);
          if (!ok) {
            return [false, new Error(`no rule ${token[1]} matches first char ${peeked.toString()}`)];
          }

          // 破壊的メソッドの影響を与えないために新しい配列を作る
          const tokens = [...(syntax[ruleIndex]?.[1] ?? [])];

          // 構文スタックに逆順で追加する
          for (const token of tokens.reverse()) {
            stack.push(token);
          }

          output.push(ruleIndex);
          break;
        }

        case "word": {
          // 文字列の場合

          const word = token[1];
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

          break;
        }

        case "char": {
          // 文字

          const min = token[1];
          const max = token[2];

          if (peeked !== EOF && min <= peekedCode && peekedCode <= max) {
            output.push(peeked);
          } else if (peeked === EOF) {
            return [false, new Error(`expect char ${min}..${max}but reaches end`)];
          } else {
            return [false, new Error(`expect char ${min}..${max}but found ${peeked}`)];
          }
          break;
        }

        case "epsilon": {
          continue;
        }
      }
    }

    // アウトプット列から構文木を作る
    const tree: Tree[] = [];
    for (const ident of output.reverse()) {
      if (typeof ident === "number") {
        const [_, tokens] = syntax[ident]!;

        tree.push({
          index: ident,
          children: tree.splice(-tokens.length, tokens.length).reverse(),
        });
      } else {
        tree.push(ident);
      }
    }

    return [true, tree[0]!];
  };
};
