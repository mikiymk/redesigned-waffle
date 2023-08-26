import { getMatchRuleIndex } from "../left-to-right-leftmost/get-match-rule";
import { eof, reference } from "../rules/define-rules";
import { EOFSymbol } from "../rules/eof-symbol";
import { ReferenceSymbol } from "../rules/reference-symbol";
import { WordSymbol } from "../rules/word-symbol";

import type { ParseReader, Result } from "../reader/parse-reader";
import type { DirectorSetSymbol, RuleSymbol, Grammar } from "../rules/define-rules";
import type { ObjectSet } from "../util/object-set";
import type { Tree } from "./tree";

/**
 * LLパーサー
 */
export class LLParser<T> {
  grammar: Grammar<T>;
  directorSetList: ObjectSet<DirectorSetSymbol>[];

  /**
   * LRパーサーを作成する
   * @param grammar 文法
   * @param directorSetList 構文解析表
   */
  constructor(grammar: Grammar<T>, directorSetList: ObjectSet<DirectorSetSymbol>[]) {
    this.grammar = grammar;
    this.directorSetList = directorSetList;
  }

  /**
   * 文字列を読み込んで構文木を作成する
   * @param pr 読み込みオブジェクト
   * @returns 構文木オブジェクト
   */
  parse(pr: ParseReader): Result<Tree<T>> {
    // パーサー

    // 構文スタック
    const stack: RuleSymbol[] = [eof, reference("start")];

    // 出力リスト
    const output: (number | string)[] = [];

    // 入力に対してループする
    for (;;) {
      // スタックのトップ
      const symbol = stack.pop();

      if (symbol === undefined) {
        return [false, new Error(`スタックが空になりました。 出力: [${output.join(", ")}]`)];
      } else if (symbol instanceof EOFSymbol) {
        // EOFなら読み込みを終了する
        if (symbol.matchFirstChar(pr)) {
          break;
        }

        return [false, new Error("文字列の終端が期待されましたが、読んでいない残りの文字列があります。")];
      } else if (symbol instanceof ReferenceSymbol) {
        // 非終端記号の場合
        const [ok, ruleIndex] = getMatchRuleIndex(this.grammar, this.directorSetList, symbol.name, pr);
        if (!ok) {
          return [false, ruleIndex];
        }

        // 破壊的メソッドの影響を与えないために新しい配列を作る
        const symbols = [...(this.grammar[ruleIndex]?.symbols ?? [])];

        // 構文スタックに逆順で追加する
        for (const symbol of symbols.reverse()) {
          stack.push(symbol);
        }

        output.push(ruleIndex);
      } else if (symbol instanceof WordSymbol) {
        // 文字列の場合
        const [ok, result] = symbol.read(pr);
        if (ok) {
          // 成功したら出力
          output.push(result);
        } else {
          return [false, result];
        }
      }
    }

    // アウトプット列から構文木を作る
    const tree: Tree<T>[] = [];
    for (const ident of output.reverse()) {
      if (typeof ident === "number") {
        const rule = this.grammar[ident];

        if (rule) {
          const { symbols } = rule;

          const children = tree.splice(-symbols.length, symbols.length).reverse();
          tree.push({
            index: ident,
            children,
            processed: rule.process(children),
          });
        }
      } else {
        tree.push(ident);
      }
    }

    return [true, tree[0] ?? ""];
  }
}
