import { epsilon } from "./define-rules";
import { getRuleIndexes } from "./rule-indexes";
import { TokenSet } from "./token-set";

import type { Syntax, Token } from "./define-rules";

/**
 * 各ルールについて、最初の文字を求める。
 * @param syntax 構文ルールリスト
 * @returns 最初の文字の集合リスト
 */
export const getFirstSetList = (syntax: Syntax): TokenSet[] => {
  // ルールリストと同じ長さで文字集合リストを作る
  const firstSet = syntax.map(() => new TokenSet());

  for (;;) {
    let updated = false;
    // 各ルールについてループする
    for (const index of syntax.keys()) {
      const length = firstSet[index]?.size;
      generateFirstSet(syntax, firstSet, index);

      // 集合に変化があったらマーク
      if (length !== firstSet[index]?.size) {
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
const generateFirstSet = (syntax: Syntax, firstSetList: TokenSet[], index: number): TokenSet => {
  const rule = syntax[index];
  const firstSet = firstSetList[index];

  if (!firstSet || !rule) {
    throw new Error(`rule length is ${syntax.length}, but access index of ${index}`);
  }

  const [_, ...tokens] = rule;

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
export const getFirstSet = (syntax: Syntax, firstSetList: TokenSet[], tokens: Token[]): TokenSet => {
  const set = new TokenSet();
  // ルールから最初のトークンを取り出す
  for (const [index, token] of tokens.entries()) {
    switch (token[0]) {
      case "char":
      case "word": {
        // もし、文字なら、それを文字集合に追加する
        set.add(token);
        return set;
      }

      case "epsilon": {
        if (tokens[index + 1] === undefined) {
          // もし、空かつその後にトークンがないなら、空を文字集合に追加する

          set.add(token);
          return set;
        } else {
          // もし、空かつその後にトークンがあるなら、後ろのトークンを文字集合に追加する
          continue;
        }
      }

      case "ref": {
        // もし、他のルールなら、そのルールの文字集合を文字集合に追加する
        for (const index of getRuleIndexes(syntax, token[1])) {
          const referenceFirstSet = firstSetList[index];
          if (!referenceFirstSet) continue;

          for (const token of referenceFirstSet) {
            set.add(token);
          }
        }

        // 空トークンが入っているなら、次のトークンを追加する
        if (set.has(epsilon) && tokens[index + 1] !== undefined) {
          set.delete(epsilon);
          continue;
        }

        return set;
      }
    }
  }

  throw new Error(`unreached code, rule at ${JSON.stringify(tokens)}`);
};
