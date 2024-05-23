import { empty } from "@/lib/rules/define-rules";

import { eachRules } from "../left-to-right-leftmost/rule-indexes";
import { EmptySymbol } from "../rules/empty-symbol";
import { ReferenceSymbol } from "../rules/reference-symbol";
import { WordSymbol } from "../rules/word-symbol";
import { ObjectSet } from "../util/object-set";

import type { FirstSetSymbol, Grammar, SyntaxSymbol } from "@/lib/rules/define-rules";

/**
 * 各ルールについて、最初の文字を求める。
 * @param grammar 構文ルールリスト
 * @returns 最初の文字の集合リスト
 */
export const getFirstSetList = <T>(grammar: Grammar<T>): ObjectSet<FirstSetSymbol>[] => {
  // ルールリストと同じ長さで文字集合リストを作る
  const firstSet = grammar.map(() => new ObjectSet<FirstSetSymbol>());

  for (;;) {
    let updated = false;
    // 各ルールについてループする
    for (const [index, set] of firstSet.entries()) {
      const length = set.size;
      generateFirstSet(grammar, firstSet, index);

      // 集合に変化があったらマーク
      if (length !== set.size) {
        updated = true;
      }
    }

    // 全てに変化がなかったら終了
    if (!updated) {
      break;
    }
  }

  return firstSet;
};

/**
 * １つのルールの最初の文字集合を作る
 * @param grammar 構文ルールリスト
 * @param firstSetList 最初の文字集合リスト
 * @param index 作るルールのインデックス
 * @returns 作った最初の文字集合
 */
const generateFirstSet = <T>(
  grammar: Grammar<T>,
  firstSetList: ObjectSet<FirstSetSymbol>[],
  index: number,
): ObjectSet<FirstSetSymbol> => {
  const rule = grammar[index];
  const firstSet = firstSetList[index];

  if (!(firstSet && rule)) {
    throw new Error(`文法のルール数:${grammar.length}ですが、${index}個目の要素にアクセスしようとしました。`);
  }

  const symbols = rule.symbols;

  firstSet.append(getFirstSet(grammar, firstSetList, symbols));

  return firstSet;
};

/**
 * トークン列の最初の文字集合を作る
 * @param grammar 構文ルールリスト
 * @param firstSetList 最初の文字集合リスト
 * @param symbols 作るルールのトークン列
 * @returns 作った最初の文字集合
 */
export const getFirstSet = <T>(
  grammar: Grammar<T>,
  firstSetList: ObjectSet<FirstSetSymbol>[],
  symbols: SyntaxSymbol[],
): ObjectSet<FirstSetSymbol> => {
  const set = new ObjectSet<FirstSetSymbol>();
  // ルールから最初のトークンを取り出す
  for (const [index, symbol] of symbols.entries()) {
    if (symbol instanceof WordSymbol) {
      // もし、文字なら、それを文字集合に追加する
      set.add(symbol);
      return set;
    }
    if (symbol instanceof EmptySymbol) {
      if (symbols[index + 1] === undefined) {
        // もし、空かつその後にトークンがないなら、空を文字集合に追加する

        set.add(symbol);
        return set;
      }
    } else if (symbol instanceof ReferenceSymbol) {
      // もし、他のルールなら、そのルールの文字集合を文字集合に追加する
      for (const [_, [referenceFirstSet]] of eachRules(grammar, symbol.name, [firstSetList])) {
        for (const symbol of referenceFirstSet) {
          set.add(symbol);
        }
      }

      // 空トークンが入っているなら、次のトークンを追加する
      if (set.has(empty) && symbols[index + 1] !== undefined) {
        set.delete(empty);
        continue;
      }

      return set;
    }
  }

  // トークン列が空なら、空を返す
  return new ObjectSet([empty]);
};
