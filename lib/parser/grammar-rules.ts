import { ObjectSet } from "../util/object-set";

import type { Tokens } from "./tokens";
import type { AugmentedSyntax } from "../rules/define-rules";
import type { ToKey } from "../util/object-set";

/**
 *
 */
class InnerRule implements ToKey {
  readonly name: string | symbol;
  readonly tokens: number[];

  /**
   *
   * @param name 名前
   * @param tokens ルールのトークン列
   */
  constructor(name: string | symbol, tokens: number[]) {
    this.name = name;
    this.tokens = tokens;
  }

  /**
   * 他のオブジェクトと比較できる文字列
   * @returns キー文字列
   */
  toKeyString() {
    return typeof this.name === "symbol"
      ? `${this.name.toString()} [${this.tokens.join(",")}]`
      : `"${this.name.toString().replaceAll('"', '\\"').replaceAll("\\", "\\\\")}" [${this.tokens.join(",")}]`;
  }

  /**
   * オブジェクトの情報を出力する
   * @param indent インデント数
   */
  debugPrint(indent: number = 0) {
    const indentSpaces = " ".repeat(indent);
    console.log(indentSpaces, this.toKeyString());
  }
}

/**
 *
 */
export class GrammarRules {
  readonly ruleNames: (string | symbol)[];
  readonly rules: InnerRule[];
  readonly ruleNameMap: Record<string | symbol, number[]>;

  /**
   *
   * @param grammar 文法
   * @param tokenTable トークンの番号対応表
   */
  constructor(grammar: AugmentedSyntax, tokenTable: Tokens) {
    const ruleNames = new Set<string | symbol>();
    const rules = new ObjectSet<InnerRule>();

    for (const [ruleName, tokens] of grammar) {
      const tokenIndexes = tokens.map((token) => tokenTable.indexOf(token));
      const innerRule: InnerRule = new InnerRule(ruleName, tokenIndexes);

      ruleNames.add(ruleName);
      rules.add(innerRule);
    }

    this.ruleNames = [...ruleNames];
    this.rules = [...rules];

    // ルールの名前：ルール番号のマップを作成する
    const ruleNameMap = new Map<string | symbol, number[]>();

    for (const [index, rule] of this.rules.entries()) {
      const mapValue = ruleNameMap.get(rule.name) ?? [];
      mapValue.push(index);
      ruleNameMap.set(rule.name, mapValue);
    }

    this.ruleNameMap = Object.fromEntries(ruleNameMap);
  }

  /**
   * オブジェクトの情報を出力する
   * @param indent インデント数
   */
  debugPrint(indent: number = 0) {
    const indentSpaces = " ".repeat(indent);
    console.log(indentSpaces, "GrammarRules:", this.rules.length, "rules");
    for (const rule of this.rules) {
      rule.debugPrint(indent + 1);
    }
  }
}
