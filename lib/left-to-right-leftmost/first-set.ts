import { epsilon } from "./define-rules";
import { getRuleIndexes } from "./rule-indexes";

import type { Syntax } from "./define-rules";
import type { Char } from "./generate-parser";

/**
 * 各ルールについて、最初の文字を求める。
 * @param syntax 構文ルールリスト
 * @returns 最初の文字の集合リスト
 */
export const getFirstSetList = (syntax: Syntax): Set<Char>[] => {
  // ルールリストと同じ長さで文字集合リストを作る
  const firstSet = syntax.map(() => new Set<Char>());

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
const generateFirstSet = (syntax: Syntax, firstSetList: Set<Char>[], index: number): Set<Char> => {
  const rule = syntax[index];
  const firstSet = firstSetList[index];

  if (!firstSet || !rule) {
    throw new Error(`rule length is ${syntax.length}, but access index of ${index}`);
  }

  const [_, ...tokens] = rule;

  // ルールから最初のトークンを取り出す
  for (const [index, token] of tokens.entries()) {
    switch (token[0]) {
      case "char":
      case "word": {
        // もし、文字なら、それを文字集合に追加する
        firstSet.add(token);
        return firstSet;
      }

      case "epsilon": {
        if (tokens[index + 1] === undefined) {
          // もし、空かつその後にトークンがないなら、空を文字集合に追加する

          firstSet.add(token);
          return firstSet;
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

          for (const firstCharacter of referenceFirstSet) {
            firstSet.add(firstCharacter);
          }
        }

        // 空トークンが入っているなら、次のトークンを追加する
        if (firstSet.has(epsilon) && tokens[index + 1] !== undefined) {
          firstSet.delete(epsilon);
          continue;
        }

        return firstSet;
      }
    }
  }

  throw new Error(`unreached code, rule at ${JSON.stringify(syntax[index])}`);
};
