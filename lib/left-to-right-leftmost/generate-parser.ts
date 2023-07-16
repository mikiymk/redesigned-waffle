import { peek, EOF, get } from "../core/reader";

import { getDirectorSetList } from "./director-set";
import { getFirstSetList } from "./first-set";
import { getFollowSetList } from "./follow-set";
import { firstChars, isDisjoint } from "./is-disjoint";
import { getRuleIndexes } from "./rule-indexes";
import { getRuleNames } from "./rule-names";

import type { Syntax, Token } from "./define-rules";
import type { ParseReader } from "../core/reader";
import type { Result } from "../util/parser";

/**
 * 構文ルールリストからLL(1)パーサーを作成します。
 * @param syntax 構文ルールリスト
 * @returns パーサー
 */
export const generateParser = (syntax: Syntax) => {
  const firstSetList = getFirstSetList(syntax);
  const followSetList = getFollowSetList(syntax, firstSetList);
  const directorSetList = getDirectorSetList(firstSetList, followSetList);

  for (const name of getRuleNames(syntax)) {
    for (const left of getRuleIndexes(syntax, name)) {
      for (const right of getRuleIndexes(syntax, name)) {
        if (left === right) continue;

        const leftRule = directorSetList[left]!;
        const rightRule = directorSetList[right]!;

        if (!isDisjoint(leftRule, rightRule)) {
          throw new Error(`left ${leftRule.asString()} and right ${rightRule.asString()} is not disjoint`);
        }
      }
    }
  }

  // パーサー
  return (pr: ParseReader): Result<(number | string)[]> => {
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

      cases: switch (token[0]) {
        case "eof": {
          // EOFなら読み込みを終了する
          if (peeked === EOF) {
            break loop;
          } else {
            return [false, new Error("leftover string")];
          }
        }

        case "ref": {
          // 非終端記号の場合

          // 各ルールについてループする
          for (const ruleIndex of getRuleIndexes(syntax, token[1])) {
            const tokens = directorSetList[ruleIndex];

            if (tokens === undefined) {
              return [false, new Error("invalid sequence")];
            }

            // ルールの文字範囲をループ
            for (const [min, max] of firstChars(tokens)) {
              // 先読みした入力が範囲に入っている場合
              if (min <= peekedCode && peekedCode <= max) {
                const [_, ...rules] = syntax[ruleIndex] ?? [];

                // 構文スタックに逆順で追加する
                for (let index = rules.length - 1; index >= 0; index--) {
                  const rule = rules[index]!;

                  stack.push(rule);
                }

                output.push(ruleIndex);
                break cases;
              }
            }
          }

          return [false, new Error(`no rule ${token[1]} matches first char ${peeked.toString()}`)];
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

    return [true, output];
  };
};
