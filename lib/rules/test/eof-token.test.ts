import { describe, expect, test } from "vitest";

import { CharReader } from "@/lib/reader/char-reader";
import { WordReader } from "@/lib/reader/word-reader";

import { EOFToken } from "../eof-token";
import { WordToken } from "../word-token";

import type { TerminalToken } from "../base-token";

describe("#constructor", () => {
  test("成功", () => {
    expect(() => new EOFToken()).not.toThrow();
  });
});

describe("#read", () => {
  const token = new EOFToken();

  test("文字列", () => {
    const pr = new CharReader("word");

    const result = (token.read as TerminalToken["read"])(pr);

    expect(result).toEqual([false, new Error("not end of file")]);
  });

  test("文字列の終わり", () => {
    const pr = new CharReader("");

    const result = (token.read as TerminalToken["read"])(pr);

    expect(result).toEqual([true, ""]);
  });
});

describe("#matchFirstChar", () => {
  const token = new EOFToken();

  test("文字", () => {
    const pr = new WordReader(" word ");
    const result = token.matchFirstChar(pr);

    expect(result).toBe(false);
  });

  test("文字列の終端", () => {
    const pr = new WordReader(" ");
    const result = token.matchFirstChar(pr);

    expect(result).toBe(true);
  });
});

test("#isNonTerminal", () => {
  const token = new EOFToken();

  const result = token.isNonTerminal();

  expect(result).toBe(false);
});

test("#toKeyString", () => {
  const token = new EOFToken();

  const result = token.toKeyString();

  expect(result).toBe("$");
});

test("#toString", () => {
  const token = new EOFToken();

  const result = token.toString();

  expect(result).toBe("eof");
});

describe("#equal", () => {
  test("同じクラス", () => {
    const token1 = new EOFToken();
    const token2 = new EOFToken();

    const result = token1.equals(token2);

    expect(result).toBe(true);
  });

  test("違うクラス", () => {
    const token1 = new EOFToken();
    const token2 = new WordToken("word", "word");

    const result = token1.equals(token2);

    expect(result).toBe(false);
  });
});
