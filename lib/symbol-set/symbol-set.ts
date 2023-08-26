import { WordSymbol } from "../rules/word-symbol";
import { ObjectSet } from "../util/object-set";
import { ReferenceSymbol } from "../rules/reference-symbol";

import type { Grammar, NonTermSymbol, TermSymbol } from "../rules/define-rules";

/**
 * 文法規則の記号の集合です。終端記号と非終端記号に分けています。
 */
export class SymbolSet<T> {
  readonly terminalSymbolList: SymbolSetItem<WordSymbol>[] = [];
  readonly terminalSymbolSet = new ObjectSet<SymbolSetItem<WordSymbol>>();
  readonly nonTerminalSymbolList: SymbolSetItem<ReferenceSymbol>[] = [];
  readonly nonTerminalSymbolSet = new ObjectSet<SymbolSetItem<ReferenceSymbol>>();

  /**
   *
   * @param grammar 文脈自由文法
   */
  constructor(grammar: Grammar<T>) {
    let termIndex = 0;
    let nonTermIndex = 0;

    for (const rule of grammar) {
      for (const symbol of rule.symbols) {
        if (symbol instanceof WordSymbol) {
          const newItem = new SymbolSetItem(symbol, termIndex);
          if (!this.terminalSymbolSet.has(newItem)) {
            this.terminalSymbolSet.add(newItem);
            this.terminalSymbolList.push(newItem);
            termIndex++;
          }
        } else if (symbol instanceof ReferenceSymbol) {
          const newItem = new SymbolSetItem(symbol, nonTermIndex);
          if (!this.nonTerminalSymbolSet.has(newItem)) {
            this.nonTerminalSymbolSet.add(newItem);
            this.nonTerminalSymbolList.push(newItem);
            nonTermIndex++;
          }
        }
      }
    }
  }

  /**
   * 番号から登録された記号を取得します。
   * @param index ルール番号
   * @returns 終端記号
   */
  term(index: number): WordSymbol {
    const item = this.terminalSymbolList[index];

    if (item === undefined) {
      throw new RangeError(`Out-of-bounds access. length: ${this.terminalSymbolList.length} but index: ${index}.`);
    }

    return item.item;
  }

  /**
   * 終端記号からそのIDを取得します。
   * @param symbol 終端記号
   * @returns ルール番号
   */
  termIndex(symbol: WordSymbol): number {
    const item = this.terminalSymbolSet.get(new SymbolSetItem(symbol, 0));

    if (item === undefined) {
      throw new RangeError(`term set is not contains symbol: ${symbol.toString()}.`);
    }

    return item.index;
  }

  /**
   * 番号から登録された記号を取得します。
   * @param index ルール番号
   * @returns 非終端記号
   */
  nonTerm(index: number): ReferenceSymbol {
    const item = this.nonTerminalSymbolList[index];

    if (item === undefined) {
      throw new RangeError(`Out-of-bounds access. length: ${this.terminalSymbolList.length} but index: ${index}.`);
    }

    return item.item;
  }

  /**
   * 非終端記号からそのIDを取得します。
   * @param symbol 終端記号
   * @returns ルール番号
   */
  nonTermIndex(symbol: ReferenceSymbol): number {
    const item = this.nonTerminalSymbolSet.get(new SymbolSetItem(symbol, 0));

    if (item === undefined) {
      throw new RangeError(`term set is not contains symbol: ${symbol.toString()}.`);
    }

    return item.index;
  }
}

/**
 * 記号集合のアイテム
 */
class SymbolSetItem<T extends TermSymbol | NonTermSymbol> {
  item: T;
  index: number;

  /**
   * アイテムと番号を揃って記録する
   * @param item アイテム
   * @param index 番号
   */
  constructor(item: T, index: number) {
    this.item = item;
    this.index = index;
  }

  /**
   *
   * @returns キー文字列
   */
  toKeyString() {
    return this.item.toKeyString();
  }
}
