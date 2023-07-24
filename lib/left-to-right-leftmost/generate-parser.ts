import { LLParser } from "../parser/ll-1";
import { getDirectorSetList } from "../token-set/director-set-list";
import { getFirstSetList } from "../token-set/first-set-list";
import { getFollowSetList } from "../token-set/follow-set-list";

import { isLLSyntax } from "./is-ll-syntax";

import type { Syntax } from "@/lib/rules/define-rules";

/**
 * 構文ルールリストからLL(1)パーサーを作成します。
 * @param syntax 構文ルールリスト
 * @returns パーサー
 */
export const generateParser = (syntax: Syntax): LLParser => {
  const firstSetList = getFirstSetList(syntax);
  const followSetList = getFollowSetList(syntax, firstSetList);
  const directorSetList = getDirectorSetList(firstSetList, followSetList);

  const error = isLLSyntax(syntax, directorSetList);
  if (!error[0]) {
    throw error[1];
  }

  console.log("# generate parser");
  console.log("syntax:");
  for (const [name, tokens] of syntax) {
    console.log(" ", name, ...tokens.map((token) => token.toString()));
  }
  console.log("first set:");
  for (const set of firstSetList) {
    console.log(" ", set.toKeyString());
  }
  console.log("follow set:");
  for (const set of followSetList) {
    console.log(" ", set.toKeyString());
  }
  console.log("director set:");
  for (const set of directorSetList) {
    console.log(" ", set.toKeyString());
  }
  console.log();

  // パーサー
  return new LLParser(syntax, directorSetList);
};
