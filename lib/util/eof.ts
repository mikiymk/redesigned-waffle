import { EOF, get, clone } from "../core/reader";

import type { Parser } from "./parser";

/**
 * 読み込み器がファイルの終端にいることを示すパーサーです。
 * @param pr パーサーリーダー
 * @returns ファイルの終わりなら成功
 */
export const eof: Parser<void> = (pr) => {
  if (get(clone(pr)) === EOF) {
    return [true, undefined];
  }

  return [false, new Error("not end of file")];
};
