import { describe, expect, test } from "vitest";

import { CharReader } from "@/lib/reader/char-reader";
import { EOF } from "@/lib/reader/peekable-iterator";

import { ReferenceToken } from "../reference-token";
import { WordToken } from "../word-token";

describe("#constructor", () => {
  test("成功", () => {
    expect(() => new WordToken("word")).not.toThrow();
  });

  test("空文字列", () => {
    expect(() => new WordToken("")).toThrow();
  });

  test("制御文字が含まれる文字列", () => {
    expect(() => new WordToken("\0")).not.toThrow();
  });
});

describe("#read", () => {
  const token = new WordToken("word");

  test("同じ文字列", () => {
    const pr = new CharReader("word");

    const result = token.read(pr);

    expect(result).toEqual([true, "word"]);
  });

  test("違う文字列", () => {
    const pr = new CharReader("toast");

    const result = token.read(pr);

    expect(result).toEqual([false, new Error("not word")]);
  });

  test("追加の文字", () => {
    const pr = new CharReader("wordy");

    const result = token.read(pr);

    expect(result).toEqual([true, "word"]);
  });

  test("短い文字列", () => {
    const pr = new CharReader("wor");

    const result = token.read(pr);

    expect(result).toEqual([false, new Error("not word")]);
  });
});

describe("#matchFirstChar", () => {
  const token = new WordToken("word");

  test("先頭の文字", () => {
    const result = token.matchFirstChar("w");

    expect(result).toBe(true);
  });

  test("違う文字", () => {
    const result = token.matchFirstChar("g");

    expect(result).toBe(false);
  });

  test("文字列の終端", () => {
    const result = token.matchFirstChar(EOF);

    expect(result).toBe(false);
  });
});

test("#isNonTerminal", () => {
  const token = new WordToken("word");

  const result = token.isNonTerminal();

  expect(result).toBe(false);
});

test("#toKeyString", () => {
  const token = new WordToken("word");

  const result = token.toKeyString();

  expect(result).toBe('w "word"');
});

test("#toString", () => {
  const token = new WordToken("word");

  const result = token.toString();

  expect(result).toBe("word(word)");
});

describe("#equal", () => {
  test("同じクラスで同じ文字列", () => {
    const token1 = new WordToken("word");
    const token2 = new WordToken("word");

    const result = token1.equals(token2);

    expect(result).toBe(true);
  });

  test("同じクラスで違う文字列", () => {
    const token1 = new WordToken("word");
    const token2 = new WordToken("toast");

    const result = token1.equals(token2);

    expect(result).toBe(false);
  });

  test("違うクラス", () => {
    const token1 = new WordToken("word");
    const token2 = new ReferenceToken("word");

    const result = token1.equals(token2);

    expect(result).toBe(false);
  });
});
