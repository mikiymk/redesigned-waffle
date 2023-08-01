import { EOF } from "./parse-reader";

import type { ParseReader } from "./parse-reader";

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
  read(): WordToken | EOF {
    const next = this.peek();
    if (next !== EOF) this.position = this.spaceSkippedPosition + next.value.length;
    return next;
  }

  /**
   * 次の文字を読む
   * @returns 文字列の終わりになったらEOFシンボル
   */
  peek(): WordToken | EOF {
    let word = "";
    let position = this.position;

    for (;;) {
      const char = this.source[position];

      if (char === undefined) {
        return EOF;
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
      type: "word",
      value: word,
    };
  }
}
