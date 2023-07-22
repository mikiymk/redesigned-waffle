import { ReferenceToken } from "../rules/reference-token";
import { ObjectSet } from "../util/object-set";

import type { HaveGrammar, HaveTokens } from "./parse-builder";
import type { SyntaxToken } from "../rules/define-rules";
import type { ToKey } from "../util/object-set";

/**
 *
 */
export class RuleItem implements ToKey {
  readonly name: string | symbol;
  readonly tokens: SyntaxToken[];
  readonly tokenIndexes: number[];

  readonly firstToken: SyntaxToken;

  /**
   *
   * @param builder ビルダーオブジェクト
   * @param name 名前
   * @param tokens ルールのトークン列
   */
  constructor(builder: HaveTokens, name: string | symbol, tokens: SyntaxToken[]) {
    this.name = name;
    this.tokens = tokens;
    this.tokenIndexes = tokens.map((token) => builder.tokens.indexOf(token));

    const firstToken = this.tokens[0];
    if (firstToken === undefined) {
      throw new Error("rule needs 1 or more tokens");
    }

    this.firstToken = firstToken;
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
  readonly rules: RuleItem[];
  readonly ruleNameMap: Record<string | symbol, number[]>;

  /**
   *
   * @param builder ビルダーオブジェクト
   */
  constructor(builder: HaveGrammar & HaveTokens) {
    const ruleNames = new Set<string | symbol>();
    const rules = new ObjectSet<RuleItem>();

    for (const [ruleName, tokens] of builder.augmentedGrammars) {
      const innerRule: RuleItem = new RuleItem(builder, ruleName, tokens);

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
   * 番号からルールを返す
   * @param index ルール番号
   * @returns ルール
   */
  get(index: number): RuleItem {
    const item = this.rules[index];

    if (item) return item;

    throw new RangeError("out of bounce");
  }

  /**
   * ルールからルール番号を返す
   * @param name ルールの名前
   * @returns ルール番号リスト
   */
  indexes(name: string): number[] {
    const indexes = this.ruleNameMap[name];
    if (indexes) return indexes;

    throw new RangeError(`name "${name}" is not in rules`);
  }

  /**
   * 再帰的にルール名から展開する
   * @param ruleName ルール名
   * @param calledRule 無限再帰を防ぐため、一度呼ばれたルール名を記録しておく
   * @returns ルールから予測される
   */
  expansion(ruleName: string, calledRule: Set<string> = new Set()): number[] {
    if (calledRule.has(ruleName)) {
      return [];
    }
    calledRule.add(ruleName);

    const rules: number[] = [];

    for (const index of this.indexes(ruleName)) {
      // 各ルールについて実行する
      rules.push(index);

      const rule = this.get(index);

      // さらにそのルールの先頭が非終端記号だった場合、再帰的に追加する
      if (rule.firstToken instanceof ReferenceToken) {
        rules.push(...this.expansion(rule.firstToken.name, calledRule));
      }
    }

    return rules;
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
