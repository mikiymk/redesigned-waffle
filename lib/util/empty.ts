import type { Parser } from "./parser";

/**
 * １文字も読み込まずに正常に返すパーサーです。
 * @returns 常に成功
 */
export const empty: Parser<void> = () => {
  return [true, undefined];
};
