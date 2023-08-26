import { EmptySymbol } from "../rules/empty-symbol";
import { ObjectMap } from "../util/object-map";

import type { Grammar } from "../rules/define-rules";
import type { Rule } from "../rules/rule";
import type { SymbolSet } from "./symbol-set";

/**
 * 文法規則の集合
 */
export class RuleSet<T> {
  readonly rules: RuleSetItem<T>[] = [];
  readonly ruleSet = new ObjectMap<RuleSetItem<T>, number>();

  /**
   * 新しい文法規則の集合を作成します。
   * @param grammar 文脈自由文法
   * @param symbols 終端記号と非終端記号の集合
   */
  constructor(grammar: Grammar<T>, symbols: SymbolSet<T>) {
    let index = 0;

    for (const rule of grammar) {
      const ruleSymbols = [];
      for (const symbol of rule.symbols) {
        if (symbol instanceof EmptySymbol) {
          continue;
        }

        ruleSymbols.push(symbols.getIndex(symbol));
      }

      this.rules.push(new RuleSetItem(index++, rule, ruleSymbols));
    }
  }

  /**
   * 番号から文法規則を取得します。
   * @param index 番号
   * @returns 文法規則
   */
  getItem(index: number): RuleSetItem<T> {
    const item = this.rules[index];

    if (item === undefined) {
      throw new RangeError(`Out-of-bounds access. length: ${this.rules.length} but index: ${index}.`);
    }

    return item;
  }

  /**
   * 番号から文法規則を取得します。
   * @param index 番号
   * @returns 文法規則
   */
  getRule(index: number): Rule<T> {
    return this.getItem(index).rule;
  }

  /**
   * 文法規則から番号を取得します。
   * @param rule 文法規則
   * @returns 番号
   */
  getIndex(rule: Rule<T>): number {
    const item = this.ruleSet.get(new RuleSetItem(0, rule, []));

    if (item === undefined) {
      throw new RangeError(`term set is not contains symbol: ${rule.toString()}.`);
    }

    return item;
  }
}

/**
 * 番号と文法規則のペア
 */
class RuleSetItem<T> {
  rule: Rule<T>;
  index: number;
  symbolIndexes: number[];

  /**
   *
   * @param index 番号
   * @param rule 文法規則
   * @param symbolIndexes 文法規則の右側の記号の番号リスト
   */
  constructor(index: number, rule: Rule<T>, symbolIndexes: number[]) {
    this.index = index;
    this.rule = rule;
    this.symbolIndexes = symbolIndexes;
  }

  /**
   * キー用文字列を作成します。
   * @returns キー用文字列
   */
  toKeyString() {
    return this.rule.toKeyString();
  }
}
