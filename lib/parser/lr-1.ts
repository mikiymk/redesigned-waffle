import type { Tree } from "./tree";
import type { ParseTableRow } from "../left-to-right-rightmost/parse-table-row";
import type { ParseReader, Result } from "../reader/parse-reader";
import type { Syntax } from "../rules/define-rules";

/**
 * LRパーサー
 */
export class LRParser<T> {
  grammar: Syntax<T>;
  table: ParseTableRow<T>[];

  /**
   * LRパーサーを作成する
   * @param grammar 文法
   * @param table 構文解析表
   */
  constructor(grammar: Syntax<T>, table: ParseTableRow<T>[]) {
    this.grammar = grammar;
    this.table = table;
  }

  /**
   * 文字列を読み込んで構文木を作成する
   * @param pr 読み込みオブジェクト
   * @returns 構文木オブジェクト
   */
  parse(pr: ParseReader): Result<Tree<T>> {
    // 規則適用列から構文木に変換する
    const tree: Tree<T>[] = [];
    const it = this.parseIterator(pr);
    let iteratorResult: IteratorResult<string | number, Result<string>>;
    while (!(iteratorResult = it.next()).done) {
      const { value: index } = iteratorResult;

      if (typeof index === "number") {
        const rule = this.grammar[index];

        if (rule) {
          const tokens = rule.tokens;
          const children = tree.splice(-tokens.length, tokens.length);
          tree.push({
            index,
            children: children,
            processed: rule.process(children),
          });
        }
      } else {
        tree.push(index);
      }
    }

    if (!iteratorResult.value[0]) {
      return [false, iteratorResult.value[1]];
    }

    const rule = this.grammar[0];
    if (rule) {
      const { tokens } = rule;

      if (tokens.length === tree.length) {
        return [
          true,
          {
            index: 0,
            children: tree,
            processed: rule.process(tree),
          },
        ];
      }
    }

    return [false, new Error("cannot construct syntax tree")];
  }

  /**
   * パース結果のトークンとルール番号のイテレータ
   * @param pr リーダー
   * @yields トークンとルール番号
   * @returns 結果
   */
  *parseIterator(pr: ParseReader): Generator<string | number, Result<string>> {
    const stack = [0];

    for (;;) {
      const state = stack.at(-1) ?? 0;
      const [action, parameter, token] = this.table[state]?.getMatch(pr) ?? ["error"];

      switch (action) {
        case "shift": {
          const [ok, word] = token.read(pr);
          if (!ok) {
            return [false, word];
          }

          yield word;
          stack.push(parameter);
          break;
        }

        case "reduce": {
          yield parameter;
          const rule = this.grammar[parameter];
          if (rule === undefined) {
            return [false, new Error("error")];
          }

          const { name, tokens } = rule;
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
          return [true, "accept"];
        }

        default: {
          return [false, new Error("nomatch input")];
        }
      }
    }
  }
}
