import { EOF } from "./parse-reader";

import type { ParseReader, ParseToken } from "./parse-reader";

/**
 *
 */
export class TokenReaderGen {
  readonly rules: [type: string, pattern: (source: string, position: number) => string | undefined][];

  /**
   * 文字列から読み込み用オブジェクトを作成します。
   * @param tokenRules トークン化するルール
   */
  constructor(tokenRules: [type: string, pattern: string][]) {
    this.rules = tokenRules.map(([type, pattern]) => {
      const regexp = new RegExp(pattern, "g");
      return [
        type,
        (source: string, position: number): string | undefined => {
          regexp.lastIndex = position;
          return regexp.exec(source)?.[0] ?? undefined;
        },
      ];
    });
  }

  /**
   * 文字列からリーダーを作成します。
   * @param source ソース文字列
   * @returns 新しいリーダー
   */
  reader(source: string): TokenReader {
    return new TokenReader(source, this.rules);
  }
}

/**
 * パーサー用文字読みクラス
 */
class TokenReader implements ParseReader {
  readonly source;
  readonly rules;
  position = 0;

  cache: Record<string, ParseToken | EOF> = {};

  /**
   * 文字列から読み込み用オブジェクトを作成します。
   * @param source パースする文字列
   * @param tokenRules トークン化するルール
   */
  constructor(
    source: string,
    tokenRules: [type: string, pattern: (source: string, position: number) => string | undefined][],
  ) {
    this.source = source;
    this.rules = tokenRules;
  }

  /**
   * 次の文字を読み、進める
   * @param type タイプ情報
   * @returns 文字列の終わりになったらEOFシンボル
   */
  next(type: string): IteratorResult<ParseToken, EOF> {
    const next = this.peek(type);
    if (!next.done) {
      this.position += next.value.value.length;
      this.cache = {};
    }
    return next;
  }

  /**
   * 次の文字を読む
   * @param type タイプ情報
   * @returns 文字列の終わりになったらEOFシンボル
   */
  peek(type: string): IteratorResult<ParseToken, EOF> {
    if (type in this.cache) {
      const value = this.cache[type];

      if (value === EOF) {
        return { done: true, value };
      } else if (value) {
        return { done: false, value };
      }
    }

    for (const [ruleType, rulePattern] of this.rules) {
      if (type !== ruleType) continue;

      const matchResult = rulePattern(this.source, this.position);

      console.log(ruleType, rulePattern, matchResult);

      if (matchResult === undefined) continue;

      const value = {
        type: ruleType,
        value: matchResult,
      };

      this.cache[type] = value;
      return { done: false, value: value };
    }

    this.cache[type] = EOF;
    return {
      done: true,
      value: EOF,
    };
  }
}
