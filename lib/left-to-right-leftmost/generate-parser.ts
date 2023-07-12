import { getFirstSetList } from "./first-set";

import type { Syntax } from "./define-rules";

/**
 *
 * @param syntax
 */
export const generateParser = (syntax: Syntax) => {
  const firstSets = getFirstSetList(syntax);

  console.log(firstSets);
};
