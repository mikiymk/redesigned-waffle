import { describe, expect, test } from "vitest";

import { EOF, ParseReader } from "@/lib/core/reader";

import { EmptyToken } from "../empty-token";
import { WordToken } from "../word-token";

import type { TerminalToken } from "../base-token";

describe("#constructor", () => {
  test("成功", () => {
    expect(() => new EmptyToken()).not.toThrow();
  });
});

describe("#read", () => {
  const token = new EmptyToken();

  test("文字列", () => {
    const pr = new ParseReader("word");

    const result = (token.read as TerminalToken["read"])(pr);

    expect(result).toEqual([true, ""]);
  });
});

describe("#matchFirstChar", () => {
  const token = new EmptyToken();

  test("文字", () => {
    const result = (token.matchFirstChar as TerminalToken["matchFirstChar"])("w");

    expect(result).toBe(true);
  });

  test("文字列の終端", () => {
    const result = (token.matchFirstChar as TerminalToken["matchFirstChar"])(EOF);

    expect(result).toBe(true);
  });
});

test("#isNonTerminal", () => {
  const token = new EmptyToken();

  const result = token.isNonTerminal();

  expect(result).toBe(false);
});

test("#toKeyString", () => {
  const token = new EmptyToken();

  const result = token.toKeyString();

  expect(result).toBe("e");
});

test("#toString", () => {
  const token = new EmptyToken();

  const result = token.toString();

  expect(result).toBe("empty");
});

describe("#equal", () => {
  test("同じクラス", () => {
    const token1 = new EmptyToken();
    const token2 = new EmptyToken();

    const result = token1.equals(token2);

    expect(result).toBe(true);
  });

  test("違うクラス", () => {
    const token1 = new EmptyToken();
    const token2 = new WordToken("word");

    const result = token1.equals(token2);

    expect(result).toBe(false);
  });
});
