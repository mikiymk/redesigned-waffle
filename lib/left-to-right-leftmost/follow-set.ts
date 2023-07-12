import { epsilonString } from "./define-rules";
import { getFirstSet } from "./first-set";
import { getRuleIndexes } from "./rule-indexes";
import { appendSet, differenceSet } from "./set-functions";

import type { TokenString, Syntax, Token } from "./define-rules";

/**
 * 各ルールについて、続く文字の文字を求める。
 * @param syntax 構文ルールリスト
 * @param firstSetList 最初の文字集合リスト
 * @returns 続く文字の文字の集合リスト
 */
export const getFollowSetList = (syntax: Syntax, firstSetList: Set<TokenString>[]): Set<TokenString>[] => {
  // ルールリストと同じ長さで文字集合リストを作る
  const followSetList = syntax.map(() => new Set<TokenString>());

  for (;;) {
    let updated = false;
    // 各ルールについてループする
    for (const index of syntax.keys()) {
      const length = followSetList[index]?.size;

      generateFollowSet(syntax, followSetList, firstSetList, index);

      // 集合に変化があったらマーク
      if (length !== followSetList[index]?.size) {
        updated = true;
      }
    }

    // 全てに変化がなかったら終了
    if (!updated) {
      break;
    }
  }

  return followSetList;
};

/**
 * １つのルールの続く文字の文字集合を作る
 * @param syntax 構文ルールリスト
 * @param followSetList 続く文字の文字集合リスト
 * @param firstSetList 最初の文字集合リスト
 * @param index 作るルールのインデックス
 * @returns 作った続く文字の文字集合
 */
const generateFollowSet = (
  syntax: Syntax,
  followSetList: Set<TokenString>[],
  firstSetList: Set<TokenString>[],
  index: number,
): Set<TokenString> => {
  const rule = syntax[index];
  const followSet = followSetList[index];

  if (!followSet || !rule) {
    throw new Error(`rule length is ${syntax.length}, but access index of ${index}`);
  }

  const [_, ...tokens] = rule;
  //   Aj → wAiw' という形式の規則がある場合、

  //     終端記号 a が Fi(w' ) に含まれるなら、a を Fo(Ai) に追加する。
  //     ε が Fi(w' ) に含まれるなら、Fo(Aj) を Fo(Ai) に追加する。

  for (const [index, token] of tokens.entries()) {
    // 最初のトークンは飛ばす
    if (index === 0) {
      continue;
    }

    // 非終端記号なら
    if (token[0] === "ref") {
      // 現在のトークンより後ろ
      const follows = tokens.slice(index + 1);

      const followFirstSet = getFirstSet(syntax, firstSetList, follows);

      appendSet(followSet, differenceSet(followFirstSet, new Set<TokenString>([epsilonString])));

      // εが含まれる場合
      if (followFirstSet.has(epsilonString)) {
        for (const ruleIndex of getRuleIndexes(syntax, token[1])) {
          const ruleFollowlist = followSetList[ruleIndex];
          if (ruleFollowlist !== undefined) {
            appendSet(followSet, ruleFollowlist);
          }
        }
      }
    }
  }

  return new Set();
};
