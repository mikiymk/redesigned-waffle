import { peek, EOF, get } from "../core/reader";

import { getDirectorSetList } from "./director-set";
import { getFirstSetList } from "./first-set";
import { getFollowSetList } from "./follow-set";
import { getMatchRuleIndex } from "./get-match-rule";
import { isLLSyntax } from "./is-ll-syntax";

import type { Syntax, Token } from "./define-rules";
import type { ParseReader } from "../core/reader";
import type { Result } from "../util/parser";

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

  let error;
  if (((error = isLLSyntax(syntax, directorSetList)), !error[0])) {
    throw error[1];
  }

  // パーサー
  return (pr: ParseReader): Result<Tree> => {
    // 構文スタック
    const stack: (Token | ["eof"])[] = [["eof"], ["ref", "start"]];

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

          const [_, ...rules] = syntax[ruleIndex] ?? [];

          // 構文スタックに逆順で追加する
          for (const rule of rules.reverse()) {
            stack.push(rule);
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
        const [_, ...tokens] = syntax[ident]!;

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
