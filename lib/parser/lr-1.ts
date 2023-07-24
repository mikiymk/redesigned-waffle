import { peek } from "../reader/peekable-iterator";

import type { Tree } from "./tree";
import type { ParseTableRow } from "../left-to-right-rightmost/parse-table-row";
import type { ParseReader, Result } from "../reader/peekable-iterator";
import type { Syntax } from "../rules/define-rules";

/**
 *
 */
export class LRParser {
  syntax: Syntax;
  table: ParseTableRow[];

  /**
   *
   * @param table
   */
  constructor(syntax: Syntax, table: ParseTableRow[]) {
    this.syntax = syntax;
    this.table = table;
  }

  /**
   *
   * @param pr
   * @returns
   */
  parse(pr: ParseReader): Result<Tree> {
    const output: (number | string)[] = [];
    const stack = [0];

    parse_loop: for (;;) {
      const nextChar = peek(pr);

      const state = stack.at(-1) ?? 0;
      const [action, parameter, token] = this.table[state]?.getMatch(nextChar) ?? ["error"];

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
          const rule = this.syntax[parameter];
          if (rule === undefined) {
            return [false, new Error("error")];
          }

          const [name, tokens] = rule;
          for (const _ of tokens) {
            stack.pop();
          }

          const reduceState = stack.at(-1);
          if (reduceState === undefined) {
            return [false, new Error("error")];
          }

          const newState = this.table[reduceState]?.getGoto(name);
          if (newState === undefined) {
            return [false, new Error("error")];
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
    const tree: Tree[] = [];

    for (const index of [...output, 0]) {
      if (typeof index === "number") {
        const tokens = this.syntax[index]?.[1];

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

    const result = tree[0];
    if (result) {
      return [true, result];
    }

    return [false, new Error("cannot construct syntax tree")];
  }
}
