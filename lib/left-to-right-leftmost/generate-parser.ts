import { getFirstSetList } from "./first-set";

import type { Syntax } from "./define-rules";

export type Char = ["word", string] | ["char", number, number] | ["epsilon"];

/**
 *
 * @param syntax
 */
export const generateParser = (syntax: Syntax) => {
  const firstSets = getFirstSetList(syntax);

  console.log(firstSets);
};
