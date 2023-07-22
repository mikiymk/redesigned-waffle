import { reference } from "../rules/define-rules";

import { FirstSets } from "./first-set";
import { FollowSets } from "./follow-set";
import { GrammarRules } from "./grammar-rules";
import { LaLRParseTable } from "./parse-table-lalr";
import { Tokens } from "./tokens";

import type { AugmentedSyntax, Syntax } from "../rules/define-rules";

const StartSymbol = Symbol("Start");

export type HaveGrammar = {
  readonly augmentedGrammars: AugmentedSyntax;
};

export type HaveTokens = {
  readonly tokens: Tokens;
};

export type HaveRules = {
  readonly rules: GrammarRules;
};

/**
 *
 */
// eslint-disable-next-line import/no-unused-modules
export class ParseBuilder {
  /** 与えられた文法 */
  readonly grammar: Syntax;
  readonly augmentedGrammars: AugmentedSyntax;

  /**
   *
   * @param grammar 文法
   */
  constructor(grammar: Syntax) {
    this.grammar = grammar;
    this.augmentedGrammars = [[StartSymbol, [reference(grammar[0]?.[0] ?? "")]], ...grammar];
  }

  #tokens: Tokens | undefined;
  /**
   * @returns トークン辞書
   */
  get tokens(): Tokens {
    return this.#tokens ?? (this.#tokens = new Tokens(this));
  }

  #rules: GrammarRules | undefined;
  /**
   * @returns ルール辞書
   */
  get rules(): GrammarRules {
    return this.#rules ?? (this.#rules = new GrammarRules(this));
  }

  #firstSets: FirstSets | undefined;
  /**
   * @returns First集合
   */
  get firstSets(): FirstSets {
    return this.#firstSets ?? (this.#firstSets = new FirstSets(this.tokens, this.rules));
  }

  #followSets: FollowSets | undefined;
  /**
   * @returns Follow集合
   */
  get followSets(): FollowSets {
    return this.#followSets ?? (this.#followSets = new FollowSets(this.tokens, this.rules, this.firstSets));
  }

  #parseTableLALR: LaLRParseTable | undefined;
  /**
   * @returns LALR(1)パース表
   */
  get parseTableLALR(): LaLRParseTable {
    return this.#parseTableLALR ?? (this.#parseTableLALR = new LaLRParseTable(this.tokens, this.rules));
  }

  /**
   * オブジェクトの情報を出力する
   * @param indent インデント数
   */
  debugPrint(indent: number = 0) {
    const indentSpaces = " ".repeat(indent);
    console.log(indentSpaces, "ParseBuilder:");

    this.tokens.debugPrint(indent + 1);
    this.rules.debugPrint(indent + 1);
    this.firstSets.debugPrint(indent + 1);
  }
}
