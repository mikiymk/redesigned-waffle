import { eof, empty } from "@/lib/rules/define-rules";

import { ObjectSet } from "../util/object-set";
import { zip } from "../util/zip-array";

import type { FirstSets } from "./first-set";
import type { GrammarRules } from "./grammar-rules";
import type { Tokens } from "./tokens";
import type { FirstSetToken, FollowSetToken } from "@/lib/rules/define-rules";

/**
 * Follow集合リスト
 */
export class FollowSets {
  readonly tokens: Tokens;
  readonly rules: GrammarRules;
  readonly firstSets: FirstSets;

  readonly followSets: ObjectSet<FollowSetToken>[];

  /**
   * Follow集合リストを作成する
   * @param tokens トークン辞書
   * @param rules ルール辞書
   * @param firstSets First集合リスト
   */
  constructor(tokens: Tokens, rules: GrammarRules, firstSets: FirstSets) {
    this.tokens = tokens;
    this.rules = rules;
    this.firstSets = firstSets;

    // ルールリストと同じ長さで文字集合リストを作る
    this.followSets = this.rules.rules.map(() => new ObjectSet<FollowSetToken>());
    this.initialize();
  }

  /**
   * オブジェクトを初期化
   */
  initialize() {
    this.followSets[0]?.add(eof);

    for (;;) {
      let updated = false;
      // 各ルールについてループする
      for (const [_, set, rule] of zip(this.followSets, this.rules.rules)) {
        // 集合に変化があったらマーク

        updated = this.generateFollowSet(set, rule.tokenIndexes) || updated;
      }

      // 全てに変化がなかったら終了
      if (!updated) {
        break;
      }
    }
  }

  /**
   * １つのルールの続く文字の文字集合を作る
   * @param set Follow集合
   * @param tokens 続く文字の文字集合リスト
   * @returns 更新があったか
   */
  generateFollowSet(set: ObjectSet<FollowSetToken>, tokens: number[]): boolean {
    //   Aj → wAiw' という形式の規則がある場合、

    //     終端記号 a が Fi(w' ) に含まれるなら、a を Fo(Ai) に追加する。
    //     ε が Fi(w' ) に含まれるなら、Fo(Aj) を Fo(Ai) に追加する。

    let updated = false;
    for (const [index, tokenNumber] of tokens.entries()) {
      const token = this.tokens.get(tokenNumber);

      // 非終端記号なら
      if (token.isNonTerminal()) {
        // 現在のトークンより後ろのファースト集合を作る
        const followTokens = tokens.slice(index + 1);

        const followFirstSet = new ObjectSet<FirstSetToken>();
        this.firstSets.getFirstSet(followFirstSet, followTokens);

        // その非終端記号のフォロー集合に追加する
        for (const ruleIndex of this.rules.indexes(token.name)) {
          const referenceFollowSet = this.followSets[ruleIndex];

          if (referenceFollowSet) {
            const previousSize = referenceFollowSet.size;

            // 空を除いた集合を追加する
            referenceFollowSet.append(followFirstSet.difference(new ObjectSet([empty])));

            // 空が含まれるなら、このルールのフォロー集合を追加する
            if (followFirstSet.size === 0 || followFirstSet.has(empty)) {
              referenceFollowSet.append(set);
            }

            updated ||= referenceFollowSet.size !== previousSize;
          }
        }
      }
    }

    return updated;
  }

  /**
   * オブジェクトの情報を出力する
   * @param indent インデント数
   */
  debugPrint(indent: number = 0) {
    const indentSpaces = " ".repeat(indent);
    let count = 0;

    console.log(indentSpaces, "FollowSet:");
    for (const set of this.followSets) {
      console.log(indentSpaces, "", "rule", count++);

      for (const token of set) {
        token.debugPrint(indent + 2);
      }
    }
  }
}
