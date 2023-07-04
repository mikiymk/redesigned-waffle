/**
 * `word` 関数で期待した単語が読み込まれなかったときのエラー
 */
export class ParseWordError extends Error {
  /**
   * @param expected 期待した単語
   * @param actual 実際に読み込んだ単語
   */
  constructor(expected: string, actual: string) {
    super(`The parser expected "${expected}", but encountered "${actual}" instead.`);
  }
}
