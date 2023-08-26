import { describe, expect, test } from "vitest";

import { CharReader } from "@/lib/reader/char-reader";
import { WordReader } from "@/lib/reader/word-reader";

import { EOFSymbol } from "../eof-symbol";
import { WordSymbol } from "../word-symbol";

import type { TerminalSymbol } from "../base-symbol";

describe("#constructor", () => {
  test("成功", () => {
    expect(() => new EOFSymbol()).not.toThrow();
  });
});

describe("#read", () => {
  const symbol = new EOFSymbol();

  test("文字列", () => {
    const pr = new CharReader("word");

    const result = (symbol.read as TerminalSymbol["read"])(pr);

    expect(result).toEqual([false, new Error("文字列の終端ではありません。")]);
  });

  test("文字列の終わり", () => {
    const pr = new CharReader("");

    const result = (symbol.read as TerminalSymbol["read"])(pr);

    expect(result).toEqual([true, ""]);
  });
});

describe("#matchFirstChar", () => {
  const symbol = new EOFSymbol();

  test("文字", () => {
    const pr = new WordReader(" word ");
    const result = symbol.matchFirstChar(pr);

    expect(result).toBe(false);
  });

  test("文字列の終端", () => {
    const pr = new WordReader(" ");
    const result = symbol.matchFirstChar(pr);

    expect(result).toBe(true);
  });
});

test("#isNonTerminal", () => {
  const symbol = new EOFSymbol();

  const result = symbol.isNonTerminal();

  expect(result).toBe(false);
});

test("#toKeyString", () => {
  const symbol = new EOFSymbol();

  const result = symbol.toKeyString();

  expect(result).toBe("$");
});

test("#toString", () => {
  const symbol = new EOFSymbol();

  const result = symbol.toString();

  expect(result).toBe("eof");
});

describe("#equal", () => {
  test("同じクラス", () => {
    const symbol1 = new EOFSymbol();
    const symbol2 = new EOFSymbol();

    const result = symbol1.equals(symbol2);

    expect(result).toBe(true);
  });

  test("違うクラス", () => {
    const symbol1 = new EOFSymbol();
    const symbol2 = new WordSymbol("word", "word");

    const result = symbol1.equals(symbol2);

    expect(result).toBe(false);
  });
});
