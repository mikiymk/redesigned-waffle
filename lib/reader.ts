export const EOF = Symbol("EOF");
export type EOF = typeof EOF;

const Source = Symbol("source");
const Position = Symbol("position");

export type ParseReader = {
  readonly [Source]: string;
  [Position]: number;
};

export const generatePR = (source: string): ParseReader => {
  return {
    [Source]: source,
    [Position]: 0,
  };
};

export const get = (pr: ParseReader): string | EOF => {
  const char = pr[Source][pr[Position]];
  pr[Position] += 1;

  return char ?? EOF;
};

export const clone = (pr: ParseReader): ParseReader => {
  return {
    [Source]: pr[Source],
    [Position]: pr[Position],
  };
};

export const setPosition = (base: ParseReader, moveTo: ParseReader) => {
  base[Position] = moveTo[Position];
};
