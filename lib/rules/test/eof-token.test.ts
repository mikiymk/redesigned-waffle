import { describe, expect, test } from "vitest";

import { EOF, ParseReader } from "@/lib/core/reader";

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
    const pr = new ParseReader("word");

    const result = (token.read as TerminalToken["read"])(pr);

    expect(result).toEqual([false, new Error("not end of file")]);
  });

  test("文字列の終わり", () => {
    const pr = new ParseReader("");

    const result = (token.read as TerminalToken["read"])(pr);

    expect(result).toEqual([true, ""]);
  });
});

describe("#matchFirstChar", () => {
  const token = new EOFToken();

  test("文字", () => {
    const result = token.matchFirstChar("w");

    expect(result).toBe(false);
  });

  test("文字列の終端", () => {
    const result = token.matchFirstChar(EOF);

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
    const token2 = new WordToken("word");

    const result = token1.equals(token2);

    expect(result).toBe(false);
  });
});
