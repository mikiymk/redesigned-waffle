export const EOL = Symbol("EOL");
const Source = Symbol("source");
const Position = Symbol("position");

export type ParseReader = {
  readonly [Source]: string,
  [Position]: number,
};

export const generate = (src: string): ParseReader => {
  return {
    [Source]: src,
    [Position]: 0,
  };
};

export const get = (pr: ParseReader): string => {
  if (isReachEnd(pr)) {
    return EOF;
  }

  const char = pr[Source][pr[Position]];
  pr[Position] += 1;

  return char;
};

export const clone = (pr: ParseReader): ParseReader => {
  return {
    [Source]: pr[Source],
    [Position]: pr[Position],
  };
};
