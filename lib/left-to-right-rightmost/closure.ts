import { getRuleIndexes } from "../left-to-right-leftmost/rule-indexes";

import type { LR0Item } from "./lr0-item";
import type { Rule, Syntax } from "../left-to-right-leftmost/define-rules";

/**
 * ドットが非終端記号の前にある場合、その非終端記号を展開したアイテムリストを作る
 * @param item
 */
export const getClosure = (syntax: Syntax, item: LR0Item): LR0Item | undefined => {
  // アイテムからドットの後ろのトークンを得る
  const nextToken = item.tokens[item.position];

  if (nextToken?.[0] === "ref") {
    // 次のトークンが非終端記号なら
    const nextReferenceName = nextToken[1];

    return expansion;
  }
};

const expansion = (syntax: Syntax, ruleName: string): LR0Item[] => {
  const indexes = getRuleIndexes(syntax, ruleName);

  for (const index of indexes) {
    
  }
};
