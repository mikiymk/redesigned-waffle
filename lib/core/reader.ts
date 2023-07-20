export const EOF = Symbol("EOF");
export type EOF = typeof EOF;

/**
 * パーサー用文字読みクラス
 */
export class ParseReader implements Iterator<string, EOF, undefined> {
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
  next(): IteratorResult<string, EOF> {
    const next = this.peek();
    if (!next.done) this.position++;
    return next;
  }

  /**
   * 次の文字を読む
   * @returns 文字列の終わりになったらEOFシンボル
   */
  peek(): IteratorResult<string, EOF> {
    const char = this.source[this.position];
    return char === undefined
      ? {
          done: true,
          value: EOF,
        }
      : {
          done: false,
          value: char,
        };
  }
}

/**
 * 読み込みオブジェクトから１文字を読み込み、読み込み位置を１つ進めます。
 * @param pr パーサー読み込みオブジェクト
 * @returns 読み込んだ１文字。読み込みが終わりの場合、EOF
 */
export const get = (pr: ParseReader): string | EOF => {
  return pr.next().value;
};

/**
 * 読み込みオブジェクトから１文字を読み込みます。
 * @param pr パーサー読み込みオブジェクト
 * @returns 読み込んだ１文字。読み込みが終わりの場合、EOF
 */
export const peek = (pr: ParseReader): string | EOF => {
  return pr.peek().value;
};
