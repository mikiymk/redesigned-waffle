import { getRuleIndexes } from "./rule-indexes";

import type { Syntax } from "./define-rules";
import type { Char } from "./generate-parser";

export const getFirstSet = (firstSets: Set<Char>[], syntax: Syntax, index: number): Set<Char> => {
  const firstSet = firstSets[index];
  if (firstSet) {
    return firstSet;
  }

  const rule = syntax[index];
  if (rule === undefined) throw new Error(`not have index ${index} of syntax rules`);
  const [ruleName, ...tokens] = rule;

  for (const token of tokens) {
    switch (token[0]) {
      case "word": {
        const firstChar = token[1][0];
        if (firstChar === undefined) {
          continue;
        }
        const set = new Set([firstChar]);
        firstSets[index] = set;
        return set;
      }

      case "char": {
        const set = new Set([token]);
        firstSets[index] = set;
        return set;
      }

      case "ref": {
        const referenceName = token[1];
        const set = new Set(
          getRuleIndexes(syntax, referenceName)
            .map((index) => getFirstSet(firstSets, syntax, index))
            .flatMap((set) => [...set]),
        );
        if (set.size === 0) continue;
        firstSets[index] = set;
        return set;
      }
      // No default
    }
  }

  console.error(`rule must have 1 ore more tokens. but no in this rule ${ruleName}.`);
  return new Set();
};
