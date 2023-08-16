import { empty } from "@/lib/rules/define-rules";

import { eachRules } from "../left-to-right-leftmost/rule-indexes";
import { ReferenceToken } from "../rules/reference-token";
import { getFirstSet, getFirstSetList } from "../token-set/first-set";
import { ObjectSet } from "../util/object-set";

import { LR0Item } from "./lr0-item";

import type { RuleName, Syntax, FollowSetToken } from "@/lib/rules/define-rules";

/**
 * ドットが非終端記号の前にある場合、その非終端記号を展開したアイテムリストを作る
 * @param syntax 構文ルールリスト
 * @param item LR(0)アイテム
 * @returns アイテム集合
 */
export const closure = <T>(syntax: Syntax<T>, item: LR0Item<T>): LR0Item<T>[] => {
  const closuredItems = [item];
  const closuredItemSet = new ObjectSet([item]);

  for (const item of closuredItems) {
    // アイテムからドットの後ろのトークンを得る
    const nextToken = item.nextToken();

    if (nextToken instanceof ReferenceToken) {
      // 次のトークンが非終端記号なら
      // 非終端記号を展開する
      const ruleName = nextToken.name;
      const items = expansionItems(syntax, ruleName);

      // 展開した新しいアイテムを追加する
      for (const item of items) {
        if (!closuredItemSet.has(item)) {
          closuredItems.push(item);
          closuredItemSet.add(item);
        }
      }

      // さらに後ろのトークンのリスト
      const afterNextToken = item.rule.tokens.slice(item.position + 1);

      // First集合を求める
      const firstSetList = getFirstSetList(syntax);
      const afterNextTokenFirst: ObjectSet<FollowSetToken> = getFirstSet(syntax, firstSetList, afterNextToken);

      // もし、Emptyが含まれるならば、先読み集合を追加する
      if (afterNextTokenFirst.has(empty)) {
        afterNextTokenFirst.delete(empty);
        afterNextTokenFirst.append(item.lookahead);
      }

      for (const item of items) {
        item.lookahead.append(afterNextTokenFirst);
      }
    }
  }

  return closuredItems.slice(1);
};

/**
 * ルール名から展開する
 * @param syntax 構文ルールリスト
 * @param ruleName ルール名
 * @returns ルールから予測される
 */
const expansionItems = <T>(syntax: Syntax<T>, ruleName: RuleName): LR0Item<T>[] => {
  const items: LR0Item<T>[] = [];

  for (const [_, [rule]] of eachRules(syntax, ruleName, [syntax])) {
    // 各ルールについて実行する
    items.push(new LR0Item(rule));
  }

  return items;
};
