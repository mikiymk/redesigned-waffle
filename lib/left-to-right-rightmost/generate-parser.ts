import { getRuleNames } from "../left-to-right-leftmost/rule-names";
import { LRParser } from "../parser/lr-1";
import { ReferenceToken } from "../rules/reference-token";
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
  for (const { tokens } of syntax) {
    for (const token of tokens) {
      if (token instanceof ReferenceToken && !ruleNames.includes(token.name)) {
        throw new Error(`存在しないルール名を参照しています。 ${primitiveToString(token.name)}`);
      }
    }
  }

  const table = generateParseTable(syntax);

  return new LRParser(syntax, table);
};
