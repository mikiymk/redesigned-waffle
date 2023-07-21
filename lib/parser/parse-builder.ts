import { reference } from "../rules/define-rules";
import { getFollowSetList } from "../token-set/follow-set-list";

import { FirstSets } from "./first-set";
import { GrammarRules } from "./grammar-rules";
import { Tokens } from "./tokens";

import type { AugmentedSyntax, FollowSetToken, Syntax } from "../rules/define-rules";
import type { TokenSet } from "../token-set/token-set";

const StartSymbol = Symbol("Start");

/**
 *
 */
// eslint-disable-next-line import/no-unused-modules
export class ParseBuilder {
  /** 与えられた文法 */
  readonly grammar: Syntax;
  readonly augmentedGrammars: AugmentedSyntax;
  readonly tokens: Tokens;
  readonly rules: GrammarRules;

  /** First集合 */
  readonly firstSets: FirstSets;

  /** Follow集合 */
  followSets: TokenSet<FollowSetToken>[] | undefined;

  /**
   *
   * @param grammar 文法
   */
  constructor(grammar: Syntax) {
    this.grammar = grammar;
    this.augmentedGrammars = [[StartSymbol, [reference(grammar[0]?.[0] ?? "")]], ...grammar];
    this.tokens = new Tokens(this.augmentedGrammars);
    this.rules = new GrammarRules(this.augmentedGrammars, this.tokens);
    this.firstSets = new FirstSets(this.tokens, this.rules);
  }

  /**
   *
   * @returns 自身を返す
   */
  generateFollowSet() {
    if (this.firstSets === undefined) {
      throw new Error("first set is not collected.");
    }

    this.followSets = getFollowSetList(this.grammar, this.firstSets);

    return this;
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
