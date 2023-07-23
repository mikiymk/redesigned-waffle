import { EOF } from "./peekable-iterator";

import type { ParseReader } from "./peekable-iterator";

type CharToken = { type: "char"; value: string };
/**
 * パーサー用文字読みクラス
 */
export class CharReader implements ParseReader {
  readonly source;
  position = 0;

  /**
   * 文字列から読み込み用オブジェクトを作成します。
   * @param source パースする文字列
   */
  constructor(source: string) {
    this.source = source;
  }

  /**
   * 次の文字を読み、進める
   * @returns 文字列の終わりになったらEOFシンボル
   */
  next(): IteratorResult<CharToken, EOF> {
    const next = this.peek();
    if (!next.done) this.position++;
    return next;
  }

  /**
   * 次の文字を読む
   * @returns 文字列の終わりになったらEOFシンボル
   */
  peek(): IteratorResult<CharToken, EOF> {
    const char = this.source[this.position];
    return char === undefined
      ? {
          done: true,
          value: EOF,
        }
      : {
          done: false,
          value: {
            type: "char",
            value: char,
          },
        };
  }
}
