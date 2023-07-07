import { EOF, get, clone, setPosition } from "../core/reader";

import type { Parser } from "./parser";

/**
 * 読み込み器がファイルの終端にいることを示すパーサーです。
 * @param pr パーサーリーダー
 * @returns ファイルの終わりなら成功
 */
export const eof: Parser<void> = (pr) => {
  const cloned = clone(pr);

  if (get(cloned) === EOF) {
    setPosition(pr, cloned);
    return [true, undefined];
  }

  return [false, new Error("not end of file")];
};
