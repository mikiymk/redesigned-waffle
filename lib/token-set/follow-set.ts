import { eof, empty } from "@/lib/rules/define-rules";

import { getRuleIndexesFromName } from "../left-to-right-leftmost/rule-indexes";
import { ObjectSet } from "../util/object-set";

import { getFirstSet } from "./first-set";

import type { FirstSetToken, FollowSetToken, Syntax } from "@/lib/rules/define-rules";

/**
 * 各ルールについて、続く文字の文字を求める。
 * @param syntax 構文ルールリスト
 * @param firstSetList 最初の文字集合リスト
 * @returns 続く文字の文字の集合リスト
 */
export const getFollowSetList = (
  syntax: Syntax,
  firstSetList: ObjectSet<FirstSetToken>[],
): ObjectSet<FollowSetToken>[] => {
  // ルールリストと同じ長さで文字集合リストを作る
  const followSetList = syntax.map(() => new ObjectSet<FollowSetToken>());

  followSetList[0]?.add(eof);

  for (;;) {
    let updated = false;
    // 各ルールについてループする
    for (const index of syntax.keys()) {
      // 集合に変化があったらマーク
      updated = generateFollowSet(syntax, followSetList, firstSetList, index) || updated;
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
 * @returns 集合に変化があったかどうか
 */
const generateFollowSet = (
  syntax: Syntax,
  followSetList: ObjectSet<FollowSetToken>[],
  firstSetList: ObjectSet<FirstSetToken>[],
  index: number,
): boolean => {
  const rule = syntax[index];
  const followSet = followSetList[index];

  if (!followSet || !rule) {
    throw new Error(`rule length is ${syntax.length}, but access index of ${index}`);
  }

  let updated = false;
  const tokens = rule[1];

  //   Aj → wAiw' という形式の規則がある場合、

  //     終端記号 a が Fi(w' ) に含まれるなら、a を Fo(Ai) に追加する。
  //     ε が Fi(w' ) に含まれるなら、Fo(Aj) を Fo(Ai) に追加する。

  for (const [index, token] of tokens.entries()) {
    // 非終端記号なら
    if (token.isNonTerminal()) {
      // 現在のトークンより後ろのファースト集合を作る
      const follows = tokens.slice(index + 1);
      const followFirstSet = getFirstSet(syntax, firstSetList, follows);

      // その非終端記号のフォロー集合に追加する
      for (const ruleIndex of getRuleIndexesFromName(syntax, token.name)) {
        const referenceFollowSet = followSetList[ruleIndex];

        if (referenceFollowSet !== undefined) {
          const length = referenceFollowSet.size;

          // 空を除いた集合を追加する
          referenceFollowSet.append(followFirstSet.difference(new ObjectSet([empty])));

          // 空が含まれるなら、このルールのフォロー集合を追加する
          if (followFirstSet.has(empty)) {
            referenceFollowSet.append(followSet);
          }

          // 長さが変わったことを検出する
          if (length !== referenceFollowSet.size) {
            updated = true;
          }
        }
      }
    }
  }

  return updated;
};
