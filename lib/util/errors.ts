/**
 * `word` 関数で期待した単語が読み込まれなかったときのエラー
 */
export class ParseWordError extends Error {
  override name = "ParseWordError";

  /**
   * @param expected 期待した単語
   * @param actual 実際に読み込んだ単語
   */
  constructor(expected: string, actual: string) {
    super(`The parser expected "${expected}", but encountered "${actual}" instead.`);
  }
}

/**
 * `char` 関数で期待した文字が読み込まれなかったときのエラー
 */
export class ParseCharError extends Error {
  override name = "ParseCharError";

  /**
   * @param a 期待した最小の文字コード
   * @param b 期待した最大の文字コード
   * @param actual 実際に読み込んだ単語
   */
  constructor(a: number, b: number, actual: string) {
    const aChar = String.fromCodePoint(a);
    const bChar = String.fromCodePoint(b);
    const aCode = ("000" + a.toString(16)).slice(-4);
    const bCode = ("000" + b.toString(16)).slice(-4);

    super(
      `The parser expected characters in range ['${aChar}'(${aCode}), '${bChar}'(${bCode})], but encountered "${actual}" instead.`,
    );
  }
}

/**
 * `either` 関数で全ての分岐がエラーだったときのエラー
 */
export class ParseEitherError extends Error {
  override name = "ParseEitherError";

  /**
   * @param errors 期待した最小の文字コード
   */
  constructor(errors: Error[]) {
    super(`All branches below failed.\n${errors.map((error) => `  ${error.name}: ${error.message}`).join("\n")}`, {
      cause: errors,
    });
  }
}