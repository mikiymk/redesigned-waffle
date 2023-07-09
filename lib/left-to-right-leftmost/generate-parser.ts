import { getFirstSet } from "./first-set";
import { getRuleIndexes } from "./rule-indexes";

import type { Syntax } from "./define-rules";

export type Char = string | [tag: "char", min: number, max: number] | [tag: "epsilon"];

export const generateParser = (syntax: Syntax) => {
  const firstSets: Set<Char>[] = [];
  for (let index = 0; index < syntax.length; index++) {
    firstSets[index] = getFirstSet(firstSets, syntax, index);
  }

  console.log(firstSets);

  const followSets: Set<Char>[] = [];

  const startRules = getRuleIndexes(syntax, "start");
};
