import { epsilon } from "./define-rules";
import { getRuleIndexes } from "./rule-indexes";

import type { Syntax } from "./define-rules";
import type { Char } from "./generate-parser";

/**
 * 各ルールについて、最初の文字を求める。
 * @param syntax 構文ルールリスト
 * @returns 最初の文字の集合リスト
 */
export const getFollowSetList = (syntax: Syntax): Set<Char>[] => {
  // ルールリストと同じ長さで文字集合リストを作る
  const followSet = syntax.map(() => new Set<Char>());

  for (;;) {
    let updated = false;
    // 各ルールについてループする
    for (const index of syntax.keys()) {
      const length = followSet[index]?.size;

      generateFollowSet(syntax, followSet, index);

      // 集合に変化があったらマーク
      if (length !== followSet[index]?.size) {
        updated = true;
      }
    }

    // 全てに変化がなかったら終了
    if (!updated) {
      break;
    }
  }

  return followSet;
};

/**
 * １つのルールの最初の文字集合を作る
 * @param syntax 構文ルールリスト
 * @param firstSetList 最初の文字集合リスト
 * @param index 作るルールのインデックス
 * @returns 作った最初の文字集合
 */
const generateFollowSet = (syntax: Syntax, firstSetList: Set<Char>[], index: number): Set<Char> => {
  const rule = syntax[index];
  const firstSet = firstSetList[index];

  if (!firstSet || !rule) {
    throw new Error(`rule length is ${syntax.length}, but access index of ${index}`);
  }

  //   Aj → wAiw' という形式の規則がある場合、

  //     終端記号 a が Fi(w' ) に含まれるなら、a を Fo(Ai) に追加する。
  //     ε が Fi(w' ) に含まれるなら、Fo(Aj) を Fo(Ai) に追加する。

  return new Set();
};
