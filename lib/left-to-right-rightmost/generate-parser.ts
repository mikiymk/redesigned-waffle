import { LRParser } from "../parser/lr-1";

import { generateParseTable } from "./transition-table";

import type { Syntax } from "../rules/define-rules";

/**
 * 構文ルールリストからLL(1)パーサーを作成します。
 * @param syntax 構文ルールリスト
 * @returns パーサー
 */
export const generateParser = (syntax: Syntax) => {
  const table = generateParseTable(syntax);

  for (const [index, row] of table.entries()) {
    console.log("rule", index);
    row.printDebugInfo();
  }

  return new LRParser(syntax, table);
};
