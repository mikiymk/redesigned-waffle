import { getRuleIndexesFromName } from "../left-to-right-leftmost/rule-indexes";
import { ReferenceToken } from "../rules/reference-token";

import { LR0Item } from "./lr0-item";

import type { RuleName, Syntax } from "@/lib/rules/define-rules";

/**
 * ドットが非終端記号の前にある場合、その非終端記号を展開したアイテムリストを作る
 * @param syntax 構文ルールリスト
 * @param item LR(0)アイテム
 * @returns アイテム集合
 */
export const closure = <T>(syntax: Syntax<T>, item: LR0Item<T>): LR0Item<T>[] => {
  // アイテムからドットの後ろのトークンを得る
  const nextToken = item.nextToken();

  if (nextToken instanceof ReferenceToken) {
    // 次のトークンが非終端記号なら
    const ruleName = nextToken.name;

    return expansionItems(syntax, ruleName);
  }

  return [];
};

/**
 * 再帰的にルール名から展開する
 * @param syntax 構文ルールリスト
 * @param ruleName ルール名
 * @param calledRule 無限再帰を防ぐため、一度呼ばれたルール名を記録しておく
 * @returns ルールから予測される
 */
const expansionItems = <T>(
  syntax: Syntax<T>,
  ruleName: RuleName,
  calledRule: Set<RuleName> = new Set(),
): LR0Item<T>[] => {
  calledRule.add(ruleName);

  const items: LR0Item<T>[] = [];

  for (const index of getRuleIndexesFromName(syntax, ruleName)) {
    // 各ルールについて実行する
    const rule = syntax[index];
    if (rule === undefined) {
      throw new Error("no match rule and syntax");
    }

    items.push(new LR0Item(rule));

    // さらにそのルールの先頭が非終端記号だった場合、再帰的に追加する
    const firstToken = rule.tokens[0];
    if (firstToken instanceof ReferenceToken && !calledRule.has(firstToken.name)) {
      items.push(...expansionItems(syntax, firstToken.name));
    }
  }

  return items;
};
