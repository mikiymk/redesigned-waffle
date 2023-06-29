import { ParseReader, EOF, get } from "./parse-reader";

type ResultSuccess<T> =
  readonly [isSuccess: true, value: T];

type ResultFailure<E extends Error> =
  readonly [isSuccess: false, value: E];

export type Result<T, E extends Error = Error> =
  | ResultSuccess<T>
  | ResultFailure<E>;

export type Parser<T> = (pr: ParseReader) => Result<T>;

export const $const = (value: T) => (): ResultSuccess<T> => {
  return [true, value];
};

export const $expect = (str: string) => (pr: ParseReader): Result<string> => {
  const readString = [];

  for (let i = 0; i < str.length; i++) {
    const readChar = get(pr);

    if (readChar === EOF) {
      return [false, new Error("reach to end of string")];
    }

    readString.push(readChar);
  }

  return [true, readString.join("")];
};

export const $while = <T>(containParser: Perser<T>, endParser: Parser<void>, delimiterParser?: Parser<void>) => (pr: ParseReader): Result<T[]> => {
  const result = [];
  for (;;) {
    const [contOk, cont] = containParser(pr);
    if (!contOk) {
      return [false, cont];
    }

    result.push(cont);
    
    if (delimiterParser) {
      const [delOk, v] = delimiterParser(pr);
      
      if (!delOk) {
        return [false, v];
      }
    }
    const [endOk, v] = endParser(pr);
    
    if (!endOk) {
      return [false, v];
    }
  }

  return [true, result];
};

export const $switch = (...conditions: Parser<T>[]) => (pr: ParseReader): Result<T>=> {
  for (const parser of conditions) {
    const [ok, value] = parser(pr);
    if (ok) {
      return [true, value];
    }
  }

  return [false, new Error("uncaught condition")];
};
