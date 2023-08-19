import { EOF } from "./parse-reader";

import type { ParseReader } from "./parse-reader";

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
  read(): CharToken | EOF {
    const next = this.peek();
    if (next !== EOF) {
      this.position++;
    }
    return next;
  }

  /**
   * 次の文字を読む
   * @returns 文字列の終わりになったらEOFシンボル
   */
  peek(): CharToken | EOF {
    const char = this.source[this.position];
    return char === undefined
      ? EOF
      : {
          type: "char",
          value: char,
        };
  }
}
