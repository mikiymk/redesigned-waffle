import { describe, expect, test } from "vitest";

import { WordReader } from "@/lib/reader/word-reader";

import { ReferenceSymbol } from "../reference-symbol";
import { WordSymbol } from "../word-symbol";

describe("#constructor", () => {
  test("成功", () => {
    expect(() => new WordSymbol("word", "word")).not.toThrow();
  });

  test("空文字列", () => {
    expect(() => new WordSymbol("word", "")).toThrow();
  });

  test("タイプが空文字列", () => {
    expect(() => new WordSymbol("", "word")).toThrow();
  });

  test("制御文字が含まれる文字列", () => {
    expect(() => new WordSymbol("word", "\0")).not.toThrow();
  });

  test("単語を指定しない", () => {
    expect(() => new WordSymbol("word", undefined)).not.toThrow();
  });
});

describe("#read", () => {
  describe("ワード指定あり", () => {
    const symbol = new WordSymbol("word", "word");

    test("同じ文字列", () => {
      const pr = new WordReader("word");

      const result = symbol.read(pr);

      expect(result).toEqual([true, "word"]);
    });

    test("違う文字列", () => {
      const pr = new WordReader("toast");

      const result = symbol.read(pr);

      expect(result).toEqual([false, new Error("toastは単語とマッチしません。")]);
    });

    test("追加の文字", () => {
      const pr = new WordReader("wordy");

      const result = symbol.read(pr);

      expect(result).toEqual([false, new Error("wordyは単語とマッチしません。")]);
    });

    test("短い文字列", () => {
      const pr = new WordReader("wor");

      const result = symbol.read(pr);

      expect(result).toEqual([false, new Error("worは単語とマッチしません。")]);
    });

    test("空文字列", () => {
      const pr = new WordReader("");

      const result = symbol.read(pr);

      expect(result).toEqual([false, new Error("文字列の終端に到達しました。")]);
    });
  });

  describe("ワード指定なし", () => {
    const symbol = new WordSymbol("word", undefined);

    test("同じ文字列", () => {
      const pr = new WordReader("word");

      const result = symbol.read(pr);

      expect(result).toEqual([true, "word"]);
    });

    test("違う文字列", () => {
      const pr = new WordReader("toast");

      const result = symbol.read(pr);

      expect(result).toEqual([true, "toast"]);
    });

    test("追加の文字", () => {
      const pr = new WordReader("wordy");

      const result = symbol.read(pr);

      expect(result).toEqual([true, "wordy"]);
    });

    test("短い文字列", () => {
      const pr = new WordReader("wor");

      const result = symbol.read(pr);

      expect(result).toEqual([true, "wor"]);
    });

    test("空文字列", () => {
      const pr = new WordReader("");

      const result = symbol.read(pr);

      expect(result).toEqual([false, new Error("文字列の終端に到達しました。")]);
    });
  });
});

describe("#matchFirstChar", () => {
  describe("ワード指定あり", () => {
    const symbol = new WordSymbol("word", "word");

    test("先頭の文字", () => {
      const pr = new WordReader(" word ");
      const result = symbol.matchFirstChar(pr);

      expect(result).toBe(true);
    });

    test("違う文字", () => {
      const pr = new WordReader(" group ");
      const result = symbol.matchFirstChar(pr);

      expect(result).toBe(false);
    });

    test("文字列の終端", () => {
      const pr = new WordReader(" ");
      const result = symbol.matchFirstChar(pr);

      expect(result).toBe(false);
    });
  });

  describe("ワード指定なし", () => {
    const symbol = new WordSymbol("word", undefined);

    test("先頭の文字", () => {
      const pr = new WordReader(" word ");
      const result = symbol.matchFirstChar(pr);

      expect(result).toBe(true);
    });

    test("違う文字", () => {
      const pr = new WordReader(" group ");
      const result = symbol.matchFirstChar(pr);

      expect(result).toBe(true);
    });

    test("文字列の終端", () => {
      const pr = new WordReader(" ");
      const result = symbol.matchFirstChar(pr);

      expect(result).toBe(false);
    });
  });
});

test("#isNonTerminal", () => {
  const symbol = new WordSymbol("word", "word");

  const result = symbol.isNonTerminal();

  expect(result).toBe(false);
});

test("#toKeyString", () => {
  const symbol = new WordSymbol("word", "word");

  const result = symbol.toKeyString();

  expect(result).toBe('w "word" "word"');
});

test("#toString", () => {
  const symbol = new WordSymbol("word", "word");

  const result = symbol.toString();

  expect(result).toBe("word(word:word)");
});

describe("#equal", () => {
  test("同じクラスで同じ文字列", () => {
    const symbol1 = new WordSymbol("word", "word");
    const symbol2 = new WordSymbol("word", "word");

    const result = symbol1.equals(symbol2);

    expect(result).toBe(true);
  });

  test("同じクラスで違う文字列", () => {
    const symbol1 = new WordSymbol("word", "word");
    const symbol2 = new WordSymbol("word", "toast");

    const result = symbol1.equals(symbol2);

    expect(result).toBe(false);
  });

  test("同じクラスで違うタイプ", () => {
    const symbol1 = new WordSymbol("word", "word");
    const symbol2 = new WordSymbol("toast", "word");

    const result = symbol1.equals(symbol2);

    expect(result).toBe(false);
  });

  test("違うクラス", () => {
    const symbol1 = new WordSymbol("word", "word");
    const symbol2 = new ReferenceSymbol("word");

    const result = symbol1.equals(symbol2);

    expect(result).toBe(false);
  });
});
