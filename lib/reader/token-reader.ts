import { EOF } from "./parse-reader";

import type { ParseReader, ParseToken } from "./parse-reader";

/**
 * パース中にルールにない文字が出たとき、その文字を取得します。
 * @param source ソース文字列
 * @param position パース中の位置
 * @returns 次の１文字
 */
const anyCharacter = (source: string, position: number) => {
  return source[position];
};

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
      const regexp = new RegExp(pattern, "y");

      if (regexp.test("")) {
        throw new Error(`パターン ${type} は空文字列にマッチします。 ${pattern}`);
      }

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

  cache: ParseToken | EOF | undefined;

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
   * @returns 文字列の終わりになったらEOFシンボル
   */
  read(): ParseToken | EOF {
    const next = this.peek();
    if (next !== EOF) {
      this.position += next.value.length;
      this.cache = undefined;
    }
    return next;
  }

  /**
   * 次の文字を読む
   * @returns 文字列の終わりになったらEOFシンボル
   */
  peek(): ParseToken | EOF {
    if (this.cache !== undefined) {
      return this.cache;
    }

    for (const [ruleType, rulePattern] of this.rules) {
      const matchResult = rulePattern(this.source, this.position);

      if (matchResult === undefined) {
        continue;
      }

      const value = {
        type: ruleType,
        value: matchResult,
      };

      this.cache = value;
      return value;
    }

    const value = this.source[this.position];

    if (value === undefined) {
      this.cache = EOF;
      return EOF;
    }

    throw new Error(`マッチするルールがありませんでした。次の文字: ${anyCharacter(this.source, this.position)}`);
  }
}
