import { empty } from "@/lib/rules/define-rules";

import { eachRules } from "../left-to-right-leftmost/rule-indexes";
import { ReferenceSymbol } from "../rules/reference-symbol";
import { getFirstSet, getFirstSetList } from "../symbol-set/first-set";
import { ObjectMap } from "../util/object-map";

import { LR0Item } from "./lr0-item";

import type { FollowSetSymbol, Grammar, RuleName } from "@/lib/rules/define-rules";
import type { ObjectSet } from "../util/object-set";

/**
 * ドットが非終端記号の前にある場合、その非終端記号を展開したアイテムリストを作る
 * @param grammar 構文ルールリスト
 * @param item LR(0)アイテム
 * @returns アイテム集合
 */
export const closure = <T>(grammar: Grammar<T>, item: LR0Item<T>): LR0Item<T>[] => {
  const closuredItems = [item];
  const closuredItemSet = new ObjectMap([[item, item]]);

  for (const item of closuredItems) {
    // アイテムからドットの後ろのトークンを得る
    const nextToken = item.nextSymbol();

    if (nextToken instanceof ReferenceSymbol) {
      // 次のトークンが非終端記号なら
      // 非終端記号を展開する
      const ruleName = nextToken.name;
      const expansionedItems = expansionItems(grammar, ruleName);
      const items = [];

      // 展開した新しいアイテムを追加する
      for (const item of expansionedItems) {
        const existingItem = closuredItemSet.get(item);
        if (existingItem) {
          items.push(existingItem);
        } else {
          closuredItems.push(item);
          closuredItemSet.set(item, item);
          items.push(item);
        }
      }

      // さらに後ろのトークンのリスト
      const afterNextToken = item.rule.symbols.slice(item.position + 1);

      // First集合を求める
      const firstSetList = getFirstSetList(grammar);
      const afterNextTokenFirst: ObjectSet<FollowSetSymbol> = getFirstSet(grammar, firstSetList, afterNextToken);

      // もし、Emptyが含まれるならば、先読み集合を追加する。
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
 * @param grammar 構文ルールリスト
 * @param ruleName ルール名
 * @returns ルールから予測される
 */
const expansionItems = <T>(grammar: Grammar<T>, ruleName: RuleName): LR0Item<T>[] => {
  const items: LR0Item<T>[] = [];

  for (const [_, [rule]] of eachRules(grammar, ruleName, [grammar])) {
    // 各ルールについて実行する
    items.push(new LR0Item(rule));
  }

  return items;
};
