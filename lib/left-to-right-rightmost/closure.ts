import { getRuleIndexes } from "../left-to-right-leftmost/rule-indexes";

import { getLR0Item } from "./lr0-item";

import type { LR0Item } from "./lr0-item";
import type { Syntax } from "../left-to-right-leftmost/define-rules";

/**
 * ドットが非終端記号の前にある場合、その非終端記号を展開したアイテムリストを作る
 * @param syntax 構文ルールリスト
 * @param item LR(0)アイテム
 * @returns アイテム集合
 */
export const closure = (syntax: Syntax, item: LR0Item): LR0Item[] => {
  // アイテムからドットの後ろのトークンを得る
  const nextToken = item.tokens[item.position];

  if (nextToken?.[0] === "ref") {
    // 次のトークンが非終端記号なら
    const ruleName = nextToken[1];

    return expansion(syntax, ruleName);
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
const expansion = (syntax: Syntax, ruleName: string, calledRule: Set<string> = new Set()): LR0Item[] => {
  calledRule.add(ruleName);

  const items: LR0Item[] = [];

  for (const index of getRuleIndexes(syntax, ruleName)) {
    // 各ルールについて実行する
    const rule = syntax[index];
    if (rule === undefined) {
      throw new Error("no match rule and syntax");
    }

    items.push(getLR0Item(rule));

    // さらにそのルールの先頭が非終端記号だった場合、再帰的に追加する
    const firstToken = rule[1][0];

    if (firstToken?.[0] === "ref" && !calledRule.has(firstToken[1])) {
      items.push(...expansion(syntax, firstToken[1]));
    }
  }

  return items;
};
