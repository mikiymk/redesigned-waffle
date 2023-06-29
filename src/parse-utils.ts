type ResultSuccess<T> =
  readonly [isSuccess: true, value: T];

type ResultFailure<E extends Error> =
  readonly [isSuccess: false, value: E];

export type Result<T, E extends Error = Error> =
  | ResultSuccess<T>
  | ResultFailure<E>;

export type Parser<T> = (pr: ParseReader) => Result<T>;

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
  while (!endParser(pr)[0]) {
    
  }
};
