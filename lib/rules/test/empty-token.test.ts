import { describe, expect, test } from "vitest";

import { CharReader } from "@/lib/reader/char-reader";
import { WordReader } from "@/lib/reader/word-reader";

import { EmptySymbol } from "../empty-symbol";
import { WordSymbol } from "../word-symbol";

import type { TerminalSymbol } from "../base-symbol";

describe("#constructor", () => {
  test("成功", () => {
    expect(() => new EmptySymbol()).not.toThrow();
  });
});

describe("#read", () => {
  const symbol = new EmptySymbol();

  test("文字列", () => {
    const pr = new CharReader("word");

    const result = (symbol.read as TerminalSymbol["read"])(pr);

    expect(result).toEqual([true, ""]);
  });
});

describe("#matchFirstChar", () => {
  const symbol = new EmptySymbol();

  test("文字", () => {
    const pr = new WordReader(" word ");
    const result = (symbol.matchFirstChar as TerminalSymbol["matchFirstChar"])(pr);

    expect(result).toBe(true);
  });

  test("文字列の終端", () => {
    const pr = new WordReader(" ");
    const result = (symbol.matchFirstChar as TerminalSymbol["matchFirstChar"])(pr);

    expect(result).toBe(true);
  });
});

test("#isNonTerminal", () => {
  const symbol = new EmptySymbol();

  const result = symbol.isNonTerminal();

  expect(result).toBe(false);
});

test("#toKeyString", () => {
  const symbol = new EmptySymbol();

  const result = symbol.toKeyString();

  expect(result).toBe("e");
});

test("#toString", () => {
  const symbol = new EmptySymbol();

  const result = symbol.toString();

  expect(result).toBe("empty");
});

describe("#equal", () => {
  test("同じクラス", () => {
    const symbol1 = new EmptySymbol();
    const symbol2 = new EmptySymbol();

    const result = symbol1.equals(symbol2);

    expect(result).toBe(true);
  });

  test("違うクラス", () => {
    const symbol1 = new EmptySymbol();
    const symbol2 = new WordSymbol("word", "word");

    const result = symbol1.equals(symbol2);

    expect(result).toBe(false);
  });
});
