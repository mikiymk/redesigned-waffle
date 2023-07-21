import { FirstSetToken, FollowSetToken, Syntax, Token } from "../rules/define-rules";
import { getFirstSetList } from "../token-set/first-set-list";
import { getFollowSetList } from "../token-set/follow-set-list";
import { TokenSet } from "../token-set/token-set";
import { ObjectSet, ToKey } from "../util/object-set";

/**
 *
 */
export class ParseBuilder {
  /** 与えられた文法 */
  readonly grammar: Syntax;
  readonly tokens: Tokens;
  readonly rules: Rules;

  /** First集合 */
  firstSets: TokenSet<FirstSetToken>[] | undefined;

  /** Follow集合 */
  followSets: TokenSet<FollowSetToken>[] | undefined;

  /**
   *
   * @param grammar 文法
   */
  constructor(grammar: Syntax) {
    this.grammar = grammar;
    this.tokens = new Tokens(this.grammar);
    this.rules = new Rules(this.grammar, this.tokens);
  }

  /**
   *
   * @returns 自身を返す
   */
  generateFirstSet() {
    this.firstSets = getFirstSetList(this.grammar);

    return this;
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
}

class Tokens {
  readonly tokens: Token[];
  readonly tokenKeys: string[];

  constructor(grammar: Syntax) {
    const set = new ObjectSet<Token>();

    for (const [_, tokens] of grammar) {
      set.append(tokens);
    }

    this.tokens = [...set];
    this.tokenKeys = this.tokens.map((token) => token.toKeyString());
  }

  indexOf(target: Token): number {
    const targetKey = target.toKeyString();
    for (const [index, key] of this.tokenKeys.entries()) {
      if (key === targetKey) {
        return index;
      }
    }

    throw new Error("target token " + targetKey + " is not in tokens.");
  }

  debugPrint(indent: number = 0) {
    const indentSpaces = " ".repeat(indent);
    console.log(indentSpaces, "Tokens:");
    for (const token of this.tokens) {
      // token.debugPrint(indent + 1);
    }
  }
}

class InnerRule implements ToKey {
  readonly name: string;
  readonly tokens: number[];

  constructor(name: string, tokens: number[]) {
    this.name = name;
    this.tokens = tokens;
  }

  toKeyString() {
    return `${this.name} [${this.tokens.join(",")}]`;
  }
}

class Rules {
  readonly ruleNames: string[];
  readonly rules: InnerRule[];
  readonly ruleNameMap: Record<string, InnerRule[]>;

  constructor(grammar: Syntax, tokenDictionary: Tokens) {
    const ruleNames = new Set<string>();
    const rules = new ObjectSet<InnerRule>();
    const ruleNameMap = new Map<string, InnerRule[]>();

    for (const [ruleName, tokens] of grammar) {
      const tokenIndexes = tokens.map((token) => tokenDictionary.indexOf(token));
      const innerRule: InnerRule = new InnerRule(ruleName, tokenIndexes);

      ruleNames.add(ruleName);
      rules.add(innerRule);

      const mapValue = ruleNameMap.get(ruleName) ?? [];
      mapValue.push(innerRule);
      ruleNameMap.set(ruleName, mapValue);
    }

    this.ruleNames = [...ruleNames];
    this.rules = [...rules];
    this.ruleNameMap = Object.fromEntries(ruleNameMap);
  }
}
