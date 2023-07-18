import type { Syntax } from "@/lib/rules/define-rules";

/**
 *
 * @param syntax
 * @param ruleName
 */
export const getRuleIndexes = (syntax: Syntax, ruleName: string): number[] => {
  const indexes = [];

  for (const [index, element] of syntax.entries()) {
    if (element[0] === ruleName) {
      indexes.push(index);
    }
  }

  return indexes;
};
