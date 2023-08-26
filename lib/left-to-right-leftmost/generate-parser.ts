import { LLParser } from "../parser/ll-1";
import { getDirectorSetList } from "../symbol-set/director-set";
import { getFirstSetList } from "../symbol-set/first-set";
import { getFollowSetList } from "../symbol-set/follow-set";
import { RuleSet } from "../symbol-set/rule-set";
import { SymbolSet } from "../symbol-set/symbol-set";

import { isValidLLGrammar } from "./is-ll-grammar";

import type { Grammar } from "@/lib/rules/define-rules";

/**
 * 構文ルールリストからLL(1)パーサーを作成します。
 * @param grammar 構文ルールリスト
 * @returns パーサー
 */
export const generateParser = <T>(grammar: Grammar<T>): LLParser<T> => {
  const symbolSet = new SymbolSet(grammar);
  const ruleSet = new RuleSet(grammar, symbolSet);

  const firstSetList = getFirstSetList(grammar);
  const followSetList = getFollowSetList(grammar, firstSetList);
  const directorSetList = getDirectorSetList(firstSetList, followSetList);

  const error = isValidLLGrammar(grammar, directorSetList);
  if (!error[0]) {
    throw error[1];
  }

  // パーサー
  return new LLParser(grammar, directorSetList);
};
