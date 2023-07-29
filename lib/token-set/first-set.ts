import { empty } from "@/lib/rules/define-rules";

import { getRuleIndexesFromName } from "../left-to-right-leftmost/rule-indexes";
import { EmptyToken } from "../rules/empty-token";
import { ReferenceToken } from "../rules/reference-token";
import { WordToken } from "../rules/word-token";
import { ObjectSet } from "../util/object-set";

import type { FirstSetToken, Syntax, SyntaxToken } from "@/lib/rules/define-rules";

/**
 * 各ルールについて、最初の文字を求める。
 * @param syntax 構文ルールリスト
 * @returns 最初の文字の集合リスト
 */
export const getFirstSetList = <T>(syntax: Syntax<T>): ObjectSet<FirstSetToken>[] => {
  // ルールリストと同じ長さで文字集合リストを作る
  const firstSet = syntax.map(() => new ObjectSet<FirstSetToken>());

  for (;;) {
    let updated = false;
    // 各ルールについてループする
    for (const [index, set] of firstSet.entries()) {
      const length = set.size;
      generateFirstSet(syntax, firstSet, index);

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

  return firstSet;
};

/**
 * １つのルールの最初の文字集合を作る
 * @param syntax 構文ルールリスト
 * @param firstSetList 最初の文字集合リスト
 * @param index 作るルールのインデックス
 * @returns 作った最初の文字集合
 */
const generateFirstSet = <T>(
  syntax: Syntax<T>,
  firstSetList: ObjectSet<FirstSetToken>[],
  index: number,
): ObjectSet<FirstSetToken> => {
  const rule = syntax[index];
  const firstSet = firstSetList[index];

  if (!firstSet || !rule) {
    throw new Error(`rule length is ${syntax.length}, but access index of ${index}`);
  }

  const tokens = rule.tokens;

  firstSet.append(getFirstSet(syntax, firstSetList, tokens));

  return firstSet;
};

/**
 * トークン列の最初の文字集合を作る
 * @param syntax 構文ルールリスト
 * @param firstSetList 最初の文字集合リスト
 * @param tokens 作るルールのトークン列
 * @returns 作った最初の文字集合
 */
export const getFirstSet = <T>(
  syntax: Syntax<T>,
  firstSetList: ObjectSet<FirstSetToken>[],
  tokens: SyntaxToken[],
): ObjectSet<FirstSetToken> => {
  const set = new ObjectSet<FirstSetToken>();
  // ルールから最初のトークンを取り出す
  for (const [index, token] of tokens.entries()) {
    if (token instanceof WordToken) {
      // もし、文字なら、それを文字集合に追加する
      set.add(token);
      return set;
    } else if (token instanceof EmptyToken) {
      if (tokens[index + 1] === undefined) {
        // もし、空かつその後にトークンがないなら、空を文字集合に追加する

        set.add(token);
        return set;
      } else {
        // もし、空かつその後にトークンがあるなら、後ろのトークンを文字集合に追加する
        continue;
      }
    } else if (token instanceof ReferenceToken) {
      // もし、他のルールなら、そのルールの文字集合を文字集合に追加する
      for (const index of getRuleIndexesFromName(syntax, token.name)) {
        const referenceFirstSet = firstSetList[index];
        if (!referenceFirstSet) continue;

        for (const token of referenceFirstSet) {
          set.add(token);
        }
      }

      // 空トークンが入っているなら、次のトークンを追加する
      if (set.has(empty) && tokens[index + 1] !== undefined) {
        set.delete(empty);
        continue;
      }

      return set;
    }
  }

  // トークン列が空なら、空を返す
  return new ObjectSet([empty]);
};