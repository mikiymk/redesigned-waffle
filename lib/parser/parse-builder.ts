import { reference } from "../rules/define-rules";
import { getFirstSetList } from "../token-set/first-set-list";
import { getFollowSetList } from "../token-set/follow-set-list";
import { ObjectSet } from "../util/object-set";

import type { AugmentedSyntax, FirstSetToken, FollowSetToken, Syntax, Token } from "../rules/define-rules";
import type { TokenSet } from "../token-set/token-set";
import type { ToKey } from "../util/object-set";

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
    this.augmentedGrammars = [[StartSymbol, [reference(grammar[0]?.[0] ?? "")]], ...grammar];
    this.tokens = new Tokens(this.augmentedGrammars);
    this.rules = new Rules(this.augmentedGrammars, this.tokens);
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

/**
 *
 */
class Tokens {
  readonly tokens: Token[];
  readonly tokenKeys: string[];

  /**
   *
   * @param grammar 文法
   */
  constructor(grammar: AugmentedSyntax) {
    const set = new ObjectSet<Token>();

    for (const [_, tokens] of grammar) {
      set.append(tokens);
    }

    this.tokens = [...set];
    this.tokenKeys = this.tokens.map((token) => token.toKeyString());
  }

  /**
   * トークンの番号を返す
   * @param target 探しているトークン
   * @returns 見つかったらその番号
   * @throws 見つからなかったらエラー
   */
  indexOf(target: Token): number {
    const targetKey = target.toKeyString();
    for (const [index, key] of this.tokenKeys.entries()) {
      if (key === targetKey) {
        return index;
      }
    }

    throw new Error("target token " + targetKey + " is not in tokens.");
  }

  /**
   * オブジェクトの情報を出力する
   * @param indent インデント数
   */
  debugPrint(indent: number = 0) {
    const indentSpaces = " ".repeat(indent);
    console.log(indentSpaces, "Tokens:");
    for (const _token of this.tokens) {
      // token.debugPrint(indent + 1);
    }
  }
}

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
}

/**
 *
 */
class Rules {
  readonly ruleNames: (string | symbol)[];
  readonly rules: InnerRule[];
  readonly ruleNameMap: Record<string | symbol, InnerRule[]>;

  /**
   *
   * @param grammar
   * @param tokenDictionary
   */
  constructor(grammar: AugmentedSyntax, tokenDictionary: Tokens) {
    const ruleNames = new Set<string | symbol>();
    const rules = new ObjectSet<InnerRule>();
    const ruleNameMap = new Map<string | symbol, InnerRule[]>();

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
