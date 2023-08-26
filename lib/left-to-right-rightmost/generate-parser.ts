import { getRuleNames } from "../left-to-right-leftmost/rule-names";
import { LRParser } from "../parser/lr-1";
import { ReferenceSymbol } from "../rules/reference-symbol";
import { primitiveToString } from "../util/primitive-to-string";

import { generateParseTable } from "./parse-table";

import type { Syntax } from "../rules/define-rules";

/**
 * 構文ルールリストからLL(1)パーサーを作成します。
 * @param syntax 構文ルールリスト
 * @returns パーサー
 */
export const generateParser = <T>(syntax: Syntax<T>) => {
  // ルール名があるかを検査する
  const ruleNames = getRuleNames(syntax);
  for (const { symbols } of syntax) {
    for (const symbol of symbols) {
      if (symbol instanceof ReferenceSymbol && !ruleNames.includes(symbol.name)) {
        throw new Error(`存在しないルール名を参照しています。 ${primitiveToString(symbol.name)}`);
      }
    }
  }

  const table = generateParseTable(syntax);

  return new LRParser(syntax, table);
};
