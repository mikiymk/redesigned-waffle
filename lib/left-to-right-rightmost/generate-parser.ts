import { get, peek } from "@/lib/core/reader";

import { generateParseTable } from "./transition-table";

import type { Syntax } from "../rules/define-rules";
import type { ParseReader } from "@/lib/core/reader";

/**
 * 構文ルールリストからLL(1)パーサーを作成します。
 * @param syntax 構文ルールリスト
 * @returns パーサー
 */
export const generateParser = (syntax: Syntax) => {
  const table = generateParseTable(syntax);

  return (pr: ParseReader) => {
    const output: (number | string)[] = [];
    const stack = [0];
    let state = 0;

    for (;;) {
      const nextChar = peek(pr);

      const [action, parameter] = table[state]?.getMatch(nextChar) ?? ["error"];

      switch (action) {
        case "shift": {
          get(pr);
          stack.push(parameter);
          state = parameter;
          break;
        }

        case "reduce": {
          output.push(parameter);
          const rule = syntax[parameter];
          if (rule === undefined) {
            return [];
          }

          const [name, tokens] = rule;
          for (const _ of tokens) {
            stack.pop();
          }

          const reduceState = stack.at(-1);
          if (reduceState === undefined) {
            return [];
          }

          const newState = table[reduceState]?.getGoto(name);
          if (newState === undefined) {
            return [];
          }

          stack.push(newState);
          state = newState;
          break;
        }

        case "accept": {
          return output;
        }

        default: {
          return [false, new Error("nomatch input")];
        }
      }
    }
  };
};
