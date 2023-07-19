import { get, peek } from "@/lib/core/reader";

import { transitionTable } from "./transition-table";

import type { Syntax } from "../rules/define-rules";
import type { ParseReader } from "@/lib/core/reader";

/**
 * 構文ルールリストからLL(1)パーサーを作成します。
 * @param syntax 構文ルールリスト
 * @returns パーサー
 */
export const generateParser = (syntax: Syntax) => {
  const table = transitionTable(syntax);

  return (pr: ParseReader) => {
    const output: (number | string)[] = [];
    const stack = [0];
    let state = 0;

    for (;;) {
      const nextChar = peek(pr);

      const [action, arg] = table[state]?.getMatch(nextChar);

      switch (action) {
        case "shift": {
          get(pr);
          stack.push(arg);
          state = arg;
          break;
        }

        case "reduce": {
          output.push(arg);
          const [name, tokens] = syntax[arg];
          for (const _ of tokens) {
            stack.pop();
          }

          const reduceState = stack.at(-1);
          const newState = table[state]?.getGoto(name);

          stack.push(newState);
          state = newState;
          break;
        }

        case "accept": {
          return output;
        }

        default: {
          throw new Error("no rule");
        }
      }
    }
  };
};
