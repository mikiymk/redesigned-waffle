import { peek } from "@/lib/core/reader";

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

  for (const [index, row] of table.entries()) {
    console.log("rule", index);
    console.log(row.printDebugInfo());
  }

  return (pr: ParseReader) => {
    const output: (number | string)[] = [];
    const stack = [0];

    parse_loop: for (;;) {
      const nextChar = peek(pr);

      const state = stack.at(-1) ?? 0;
      const [action, parameter, token] = table[state]?.getMatch(nextChar) ?? ["error"];

      console.log("stack:   ", stack);
      console.log("peek:    ", nextChar);
      console.log("action:  ", action, parameter);
      console.log("output:  ", output);
      console.log();

      switch (action) {
        case "shift": {
          const [ok, word] = token.read(pr);
          if (!ok) {
            return [false, word];
          }

          output.push(word);
          stack.push(parameter);
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
          break;
        }

        case "accept": {
          break parse_loop;
        }

        default: {
          return [false, new Error("nomatch input")];
        }
      }
    }

    console.log("parse end");

    // 規則適用列から構文木に変換する
    type Tree = string | { index: number; children: Tree[] };
    const tree: Tree[] = [];

    for (const index of [...output, 0]) {
      if (typeof index === "number") {
        const tokens = syntax[index]?.[1];

        if (tokens) {
          tree.push({
            index,
            children: tree.splice(-tokens.length, tokens.length),
          });
        }
      } else {
        tree.push(index);
      }
    }

    if (tree.length === 1) {
      return [true, tree[0]];
    }

    return [false, new Error("cannot construct syntax tree")];
  };
};
