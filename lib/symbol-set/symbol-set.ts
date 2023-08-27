import { empty, eof } from "../rules/define-rules";
import { EmptySymbol } from "../rules/empty-symbol";
import { EOFSymbol } from "../rules/eof-symbol";
import { ReferenceSymbol } from "../rules/reference-symbol";
import { WordSymbol } from "../rules/word-symbol";
import { ObjectSet } from "../util/object-set";

import type { Grammar, RuleSymbol } from "../rules/define-rules";

/**
 * 記号集合のアイテム
 */
class SymbolSetItem<T extends RuleSymbol> {
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
   * ２つのアイテムが等しいかどうかを判定する
   * @param other もう一つのアイテム
   * @returns ２つのアイテムが番号が等しいなら同じアイテムとする
   */
  equals(other: SymbolSetItem<RuleSymbol>) {
    return this.index === other.index;
  }

  /**
   *
   * @returns キー文字列
   */
  toKeyString() {
    return this.item.toKeyString();
  }
}

/**
 * 文法規則の記号の集合です。終端記号と非終端記号に分けています。
 */
export class SymbolSet<T> {
  readonly symbolList: SymbolSetItem<WordSymbol | ReferenceSymbol>[] = [];
  readonly terminalSymbolSet = new ObjectSet<SymbolSetItem<WordSymbol>>();
  readonly nonTerminalSymbolSet = new ObjectSet<SymbolSetItem<ReferenceSymbol>>();

  static readonly eof = new SymbolSetItem(eof, -1);
  static readonly empty = new SymbolSetItem(empty, -2);

  /**
   *
   * @param grammar 文脈自由文法
   */
  constructor(grammar: Grammar<T>) {
    let index = 0;

    for (const rule of grammar) {
      for (const symbol of rule.symbols) {
        if (symbol instanceof WordSymbol) {
          const newItem = new SymbolSetItem(symbol, index);
          if (!this.terminalSymbolSet.has(newItem)) {
            this.terminalSymbolSet.add(newItem);
            this.symbolList.push(newItem);
            index++;
          }
        } else if (symbol instanceof ReferenceSymbol) {
          const newItem = new SymbolSetItem(symbol, index);
          if (!this.nonTerminalSymbolSet.has(newItem)) {
            this.nonTerminalSymbolSet.add(newItem);
            this.symbolList.push(newItem);
            index++;
          }
        }
      }
    }
  }

  /**
   * 集合に属する全ての終端記号をループします。
   * @yields
   */
  *terms(): Generator<SymbolSetItem<WordSymbol>> {
    for (const item of this.terminalSymbolSet) {
      yield item;
    }
  }

  /**
   * 集合に属する全ての非終端記号をループします。
   * @yields
   */
  *nonTerms(): Generator<SymbolSetItem<ReferenceSymbol>> {
    for (const item of this.nonTerminalSymbolSet) {
      yield item;
    }
  }

  /**
   * 番号から登録された記号を取得します。
   * @param index ルール番号
   * @returns 記号
   */
  getItem(index: number): SymbolSetItem<RuleSymbol> {
    if (index === -1) {
      return SymbolSet.eof;
    } else if (index === -2) {
      return SymbolSet.empty;
    }

    const item = this.symbolList[index];

    if (item === undefined) {
      throw new RangeError(`Out-of-bounds access. length: ${this.symbolList.length} but index: ${index}.`);
    }

    return item;
  }

  /**
   * 番号から登録された記号を取得します。
   * @param index ルール番号
   * @returns 記号
   */
  getSymbol(index: number): RuleSymbol {
    return this.getItem(index).item;
  }

  /**
   * 終端記号からそのIDを取得します。
   * @param symbol 終端記号
   * @returns ルール番号
   */
  getIndex(symbol: RuleSymbol): number {
    if (symbol instanceof EmptySymbol) {
      return -2;
    } else if (symbol instanceof EOFSymbol) {
      return -1;
    }

    const item =
      symbol instanceof WordSymbol
        ? this.terminalSymbolSet.get(new SymbolSetItem(symbol, 0))
        : this.nonTerminalSymbolSet.get(new SymbolSetItem(symbol, 0));

    if (item === undefined) {
      throw new RangeError(`term set is not contains symbol: ${symbol.toString()}.`);
    }

    return item.index;
  }
}
