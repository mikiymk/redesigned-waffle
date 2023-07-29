import { LRParser } from "../parser/lr-1";

import { generateParseTable } from "./parse-table";

import type { Syntax } from "../rules/define-rules";

/**
 * 構文ルールリストからLL(1)パーサーを作成します。
 * @param syntax 構文ルールリスト
 * @returns パーサー
 */
export const generateParser = <T>(syntax: Syntax<T>) => {
  const table = generateParseTable(syntax);

  table.printDebug();

  return new LRParser(syntax, table);
};
