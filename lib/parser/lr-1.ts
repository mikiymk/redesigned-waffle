import { peek, EOF } from "../reader/parse-reader";
import { empty } from "../rules/define-rules";

import type { Tree } from "./tree";
import type { ParseTable } from "../left-to-right-rightmost/parse-table";
import type { ParseReader, Result } from "../reader/parse-reader";
import type { Syntax } from "../rules/define-rules";

/**
 * LRパーサー
 */
export class LRParser<T> {
  grammar: Syntax<T>;
  table: ParseTable<T>;

  /**
   * LRパーサーを作成する
   * @param grammar 文法
   * @param table 構文解析表
   */
  constructor(grammar: Syntax<T>, table: ParseTable<T>) {
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
          const tokens = rule.tokens.filter((token) => token !== empty);
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
      return [
        false,
        new Error(`パース中にエラーが発生しました。 ${treeToString(tree)}`, { cause: iteratorResult.value[1] }),
      ];
    }

    const rule = this.grammar[0];
    if (rule) {
      const { tokens } = rule;

      if (tokens.filter((token) => token !== empty).length === tree.length) {
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

    return [false, new Error(`正しい構文木が構築されませんでした。 ${treeToString(tree)}`)];
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
      const [action, parameter, token] = this.table.match(state, pr);

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
            return [false, new Error(`Reduce操作先が無効なルール番号です。 ${parameter}`)];
          }

          const { name, tokens } = rule;
          for (const _ of tokens.filter((token) => token !== empty)) {
            stack.pop();
          }

          const reduceState = stack.at(-1);
          if (reduceState === undefined) {
            return [false, new Error(`スタックが空になりました。 状態:${state} Reduce先:${parameter}`)];
          }

          const [ok, newState] = this.table.gotoState(reduceState, name);
          if (!ok) {
            return [false, newState];
          }

          stack.push(newState);
          break;
        }

        case "accept": {
          return [true, "accept"];
        }

        default: {
          const input = peek(pr);

          const inputString = input === EOF ? "EOF" : `${input.type}:${input.value}`;
          return [false, new Error(`入力:(${inputString})に合う文字列がありませんでした。 状態:${state}`)];
        }
      }
    }
  }
}

/**
 * 構文木を文字列にします。
 * @param tree 構文木オブジェクト
 * @returns 文字列表現
 */
const treeToString = <T>(tree: Tree<T>[]): string => {
  const result = [];
  for (const t of tree) {
    if (typeof t === "string") {
      result.push(t);
    } else {
      result.push(`${t.index}: [ ${treeToString(t.children)} ]`);
    }
  }

  return result.join(", ");
};
