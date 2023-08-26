import { empty, eof } from "@/lib/rules/define-rules";

import { eachRules } from "../left-to-right-leftmost/rule-indexes";
import { ObjectSet } from "../util/object-set";

import { getFirstSet } from "./first-set";

import type { FirstSetSymbol, FollowSetSymbol, Grammar } from "@/lib/rules/define-rules";

/**
 * 各ルールについて、続く文字の文字を求める。
 * @param grammar 構文ルールリスト
 * @param firstSetList 最初の文字集合リスト
 * @returns 続く文字の文字の集合リスト
 */
export const getFollowSetList = <T>(
  grammar: Grammar<T>,
  firstSetList: ObjectSet<FirstSetSymbol>[],
): ObjectSet<FollowSetSymbol>[] => {
  // ルールリストと同じ長さで文字集合リストを作る
  const followSetList = grammar.map(() => new ObjectSet<FollowSetSymbol>());

  followSetList[0]?.add(eof);

  for (;;) {
    let updated = false;
    // 各ルールについてループする
    for (const index of grammar.keys()) {
      // 集合に変化があったらマーク
      updated = generateFollowSet(grammar, followSetList, firstSetList, index) || updated;
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
 * @param grammar 構文ルールリスト
 * @param followSetList 続く文字の文字集合リスト
 * @param firstSetList 最初の文字集合リスト
 * @param index 作るルールのインデックス
 * @returns 集合に変化があったかどうか
 */
const generateFollowSet = <T>(
  grammar: Grammar<T>,
  followSetList: ObjectSet<FollowSetSymbol>[],
  firstSetList: ObjectSet<FirstSetSymbol>[],
  index: number,
): boolean => {
  const rule = grammar[index];
  const followSet = followSetList[index];

  if (!(followSet && rule)) {
    throw new Error(`文法のルール数:${grammar.length}ですが、${index}個目の要素にアクセスしようとしました。`);
  }

  let updated = false;
  const symbols = rule.symbols;

  //   Aj → wAiw' という形式の規則がある場合、

  //     終端記号 a が Fi(w' ) に含まれるなら、a を Fo(Ai) に追加する。
  //     ε が Fi(w' ) に含まれるなら、Fo(Aj) を Fo(Ai) に追加する。

  for (const [index, symbol] of symbols.entries()) {
    // 非終端記号なら
    if (symbol.isNonTerminal()) {
      // 現在のトークンより後ろのファースト集合を作る
      const follows = symbols.slice(index + 1);
      const followFirstSet = getFirstSet(grammar, firstSetList, follows);

      // その非終端記号のフォロー集合に追加する
      for (const [_, [referenceFollowSet]] of eachRules(grammar, symbol.name, [followSetList])) {
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

  return updated;
};
