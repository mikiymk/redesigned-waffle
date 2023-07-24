import { describe, expect, test } from "vitest";

import { EOF } from "@/lib/reader/peekable-iterator";
import { WordReader } from "@/lib/reader/word-reader";

import { ReferenceToken } from "../reference-token";
import { WordToken } from "../word-token";

describe("#constructor", () => {
  test("成功", () => {
    expect(() => new WordToken("word", "word")).not.toThrow();
  });

  test("空文字列", () => {
    expect(() => new WordToken("word", "")).toThrow();
  });

  test("タイプが空文字列", () => {
    expect(() => new WordToken("", "word")).toThrow();
  });

  test("制御文字が含まれる文字列", () => {
    expect(() => new WordToken("word", "\0")).not.toThrow();
  });
});

describe("#read", () => {
  const token = new WordToken("word", "word");

  test("同じ文字列", () => {
    const pr = new WordReader("word");

    const result = token.read(pr);

    expect(result).toEqual([true, "word"]);
  });

  test("違う文字列", () => {
    const pr = new WordReader("toast");

    const result = token.read(pr);

    expect(result).toEqual([false, new Error("not word")]);
  });

  test("追加の文字", () => {
    const pr = new WordReader("wordy");

    const result = token.read(pr);

    expect(result).toEqual([false, new Error("not word")]);
  });

  test("短い文字列", () => {
    const pr = new WordReader("wor");

    const result = token.read(pr);

    expect(result).toEqual([false, new Error("not word")]);
  });
});

describe("#matchFirstChar", () => {
  const token = new WordToken("word", "word");

  test("先頭の文字", () => {
    const result = token.matchFirstChar({ type: "word", value: "word" });

    expect(result).toBe(true);
  });

  test("違う文字", () => {
    const result = token.matchFirstChar({ type: "word", value: "group" });

    expect(result).toBe(false);
  });

  test("文字列の終端", () => {
    const result = token.matchFirstChar(EOF);

    expect(result).toBe(false);
  });
});

test("#isNonTerminal", () => {
  const token = new WordToken("word", "word");

  const result = token.isNonTerminal();

  expect(result).toBe(false);
});

test("#toKeyString", () => {
  const token = new WordToken("word", "word");

  const result = token.toKeyString();

  expect(result).toBe('w "word" "word"');
});

test("#toString", () => {
  const token = new WordToken("word", "word");

  const result = token.toString();

  expect(result).toBe("word(word:word)");
});

describe("#equal", () => {
  test("同じクラスで同じ文字列", () => {
    const token1 = new WordToken("word", "word");
    const token2 = new WordToken("word", "word");

    const result = token1.equals(token2);

    expect(result).toBe(true);
  });

  test("同じクラスで違う文字列", () => {
    const token1 = new WordToken("word", "word");
    const token2 = new WordToken("word", "toast");

    const result = token1.equals(token2);

    expect(result).toBe(false);
  });

  test("同じクラスで違うタイプ", () => {
    const token1 = new WordToken("word", "word");
    const token2 = new WordToken("toast", "word");

    const result = token1.equals(token2);

    expect(result).toBe(false);
  });

  test("違うクラス", () => {
    const token1 = new WordToken("word", "word");
    const token2 = new ReferenceToken("word");

    const result = token1.equals(token2);

    expect(result).toBe(false);
  });
});
