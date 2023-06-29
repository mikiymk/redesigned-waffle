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
  const readChars = [];

  for (let i = 0; i < str.length; i++) {
    const readChar = get(pr);

    if (readChar === EOF) {
      return [false, new Error("reach to end of string")];
    }

    readChars.push(readChar);
  }

  const readString = readChars.join("");
  if (str === readString) {
    return [true, readString];
  } else {
    return [false, new Error("not expected")];
  }
};

export const $while = <T>(parser: Perser<T>) => (pr: ParseReader): Result<T[]> => {
  const result = [];
  for (;;) {
    const [contOk, cont] = containParser(pr);

    if (!contOk) {
      break;
    }

    result.push(cont);
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

export const $try = (parser: Parser<T>) => (pr: ParseReader): Result<T> => {
  const cloned = clone(pr);
  const [ok, value] = parser(cloned);
  
  if (ok) {
    reflect(pr, cloned);
    return [true, value];
  } else {
    return [false, value];
  }
}
