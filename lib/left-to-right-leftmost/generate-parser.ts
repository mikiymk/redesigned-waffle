import { LLParser } from "../parser/ll-1";
import { getDirectorSetList } from "../token-set/director-set";
import { getFirstSetList } from "../token-set/first-set";
import { getFollowSetList } from "../token-set/follow-set";

import { isValidLLGrammar } from "./is-ll-syntax";

import type { Syntax } from "@/lib/rules/define-rules";

/**
 * 構文ルールリストからLL(1)パーサーを作成します。
 * @param syntax 構文ルールリスト
 * @returns パーサー
 */
export const generateParser = <T>(syntax: Syntax<T>): LLParser<T> => {
  const firstSetList = getFirstSetList(syntax);
  const followSetList = getFollowSetList(syntax, firstSetList);
  const directorSetList = getDirectorSetList(firstSetList, followSetList);

  const error = isValidLLGrammar(syntax, directorSetList);
  if (!error[0]) {
    throw error[1];
  }

  // パーサー
  return new LLParser(syntax, directorSetList);
};
