import { EOF } from "./peekable-iterator";

import type { ParseReader } from "./peekable-iterator";

type WordToken = { type: "word"; value: string };
/**
 * スペース区切りで文字列を読み込む
 */
export class WordReader implements ParseReader {
  readonly source;
  position = 0;
  private spaceSkippedPosition = 0;

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
  next(): IteratorResult<WordToken, EOF> {
    const next = this.peek();
    if (!next.done) this.position = this.spaceSkippedPosition + next.value.value.length;
    return next;
  }

  /**
   * 次の文字を読む
   * @returns 文字列の終わりになったらEOFシンボル
   */
  peek(): IteratorResult<WordToken, EOF> {
    let word = "";
    let position = this.position;

    for (;;) {
      const char = this.source[position];

      if (char === undefined) {
        return {
          done: true,
          value: EOF,
        };
      } else if (char === " ") {
        position++;
      } else {
        break;
      }
    }

    this.spaceSkippedPosition = position;

    for (;;) {
      const char = this.source[position];

      if (char === undefined || char === " ") {
        break;
      }

      word += char;
      position++;
    }

    return {
      done: false,
      value: {
        type: "word",
        value: word,
      },
    };
  }
}
