import { describe, expect, test } from "vitest";

import { CharReader } from "@/lib/reader/char-reader";
import { EOF } from "@/lib/reader/peekable-iterator";

import { CharToken } from "../char-token";
import { WordToken } from "../word-token";

describe("#constructor", () => {
  test("成功", () => {
    expect(() => new CharToken("a", "z")).not.toThrow();
  });

  test("左端文字が1文字ではない", () => {
    expect(() => new CharToken("abc", "z")).toThrow();
  });

  test("右端文字が1文字ではない", () => {
    expect(() => new CharToken("a", "xyz")).toThrow();
  });

  test("範囲が逆転している", () => {
    expect(() => new CharToken("z", "a")).toThrow('needs "z" less than "a".');
  });
});

describe("#read", () => {
  const token = new CharToken("a", "z");

  test("範囲内の文字", () => {
    const pr = new CharReader("b");

    const result = token.read(pr);

    expect(result).toEqual([true, "b"]);
  });

  test("範囲外の文字", () => {
    const pr = new CharReader("B");

    const result = token.read(pr);

    expect(result).toEqual([false, new Error("not word")]);
  });

  test("文字列の終端", () => {
    const pr = new CharReader("");

    const result = token.read(pr);

    expect(result).toEqual([false, new Error("end of file")]);
  });
});

describe("#matchFirstChar", () => {
  const token = new CharToken("a", "z");

  test("範囲内の文字", () => {
    const result = token.matchFirstChar("b");

    expect(result).toBe(true);
  });

  test("範囲外の文字", () => {
    const result = token.matchFirstChar("B");

    expect(result).toBe(false);
  });

  test("文字列の終端", () => {
    const result = token.matchFirstChar(EOF);

    expect(result).toBe(false);
  });
});

test("#isNonTerminal", () => {
  const token = new CharToken("a", "z");

  const result = token.isNonTerminal();

  expect(result).toBe(false);
});

test("#toKeyString", () => {
  const token = new CharToken("a", "z");

  const result = token.toKeyString();

  expect(result).toBe("c 97.122");
});

test("#toString", () => {
  const token = new CharToken("a", "z");

  const result = token.toString();

  expect(result).toBe("char(a[0x0061]..z[0x007a])");
});

describe("#equal", () => {
  test("同じクラスで同じ文字", () => {
    const token1 = new CharToken("a", "z");
    const token2 = new CharToken("a", "z");

    const result = token1.equals(token2);

    expect(result).toBe(true);
  });

  test("同じクラスで違う文字", () => {
    const token1 = new CharToken("a", "z");
    const token2 = new CharToken("A", "Z");

    const result = token1.equals(token2);

    expect(result).toBe(false);
  });

  test("違うクラス", () => {
    const token1 = new CharToken("a", "z");
    const token2 = new WordToken("AtoZ");

    const result = token1.equals(token2);

    expect(result).toBe(false);
  });
});
