/**
 * @file
 */

/**
 * 言語の構文
 */
export type Syntax = Rule[];

/**
 * 構文の名前付きルール
 */
export type Rule = [string, ...Token[]];

/**
 * ルール用のトークン
 */
export type Token = ["word", string] | ["char", number, number] | ["ref", string] | ["epsilon"];
export type TokenString =
  | `["word", "${string}"]`
  | `["char", ${number}, ${number}]`
  | `["ref", "${string}"]`
  | '["epsilon"]';

/**
 * 構文用のルールを作る
 * @param name ルール名
 * @param tokens ルールのトークン列
 * @returns ルールオブジェクト（タグ付きタプル）
 */
export const rule = (name: string, ...tokens: Token[]): Rule => {
  if (tokens.length === 0) {
    throw new Error(`word length must be greater than or equal to 1. received: ${tokens.length} items`);
  }

  return [name, ...tokens];
};

/**
 * 特定のキーワードのトークンを作る
 * @param word キーワード
 * @returns ルール用トークン
 */
export const word = (word: string): ["word", string] => {
  if (word.length === 0) {
    throw new Error(`word length must be greater than or equal to 1. received: ${word}(${word.length})`);
  }

  return ["word", word];
};

type StringLength<T extends string, L extends unknown[] = []> = T extends ""
  ? L["length"]
  : T extends `${infer F}${infer R}`
  ? StringLength<R, [F, ...L]>
  : never;
type StringChar<T extends string> = StringLength<T> extends 1 ? T : "Char type to a string with a length of 1";

/**
 * 特定のUnicodeコードポイント範囲にある文字のトークンを作る
 * @param min その数を含む最小コードポイント
 * @param max その数を含む最大コードポイント
 * @returns ルール用トークン
 */
export const char = <T extends string, U extends string>(
  min: StringChar<T>,
  max: StringChar<U>,
): ["char", number, number] => {
  if (min.length !== 1 || max.length !== 1) {
    throw new Error(`"${min}" and "${max}" needs length at 1.`);
  }

  const minCode = min.codePointAt(0);
  const maxCode = max.codePointAt(0);

  if (minCode === undefined || maxCode === undefined) {
    throw new Error(`"${min}" and "${max}" needs length at 1.`);
  }

  return ["char", minCode, maxCode];
};

/**
 * 他のルールのトークンを作る
 * @param terminal ルール名
 * @returns ルール用トークン
 */
export const reference = (terminal: string): ["ref", string] => {
  return ["ref", terminal];
};

/**
 * 空のトークン
 */
export const epsilon: ["epsilon"] = ["epsilon"];
export const epsilonString = '["epsilon"]';

/**
 * トークンを文字列にする
 * Setに入れるため
 * @param token トークン
 * @returns 文字列
 */
export const tokenToString = (token: Token): TokenString => {
  switch (token[0]) {
    case "char": {
      return `["char", ${token[1]}, ${token[2]}]`;
    }

    case "epsilon": {
      return '["epsilon"]';
    }

    case "ref": {
      return `["ref", "${token[1]}"]`;
    }

    case "word": {
      return `["word", "${token[1]}"]`;
    }
  }
};

/**
 * 文字列をトークンに戻す
 * @param tokenString 文字列
 * @returns トークン
 */
export const stringToToken = (tokenString: TokenString): Token => {
  const [tag, ...rest] = tokenString.split(", ");

  switch (tag) {
    case '["char"': {
      if (rest[0] && rest[1]) {
        return ["char", Number.parseInt(rest[0]), Number.parseInt(rest[1])];
      }
      break;
    }

    case '["epsilon"]': {
      return ["epsilon"];
    }

    case '["ref"': {
      if (rest[0]) {
        return ["ref", rest[0].slice(1, -2)];
      }
      break;
    }

    case '["word"': {
      if (rest[0]) {
        return ["word", rest[0].slice(1, -2)];
      }
      break;
    }
  }

  throw new Error("token string is not token string");
};
