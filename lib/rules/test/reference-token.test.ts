import { describe, expect, test } from "vitest";

import { ReferenceSymbol } from "../reference-symbol";
import { WordSymbol } from "../word-symbol";

describe("#constructor", () => {
  test("文字列", () => {
    expect(() => new ReferenceSymbol("A")).not.toThrow();
  });

  test("空文字列", () => {
    expect(() => new ReferenceSymbol("")).toThrow();
  });

  test("シンボル", () => {
    expect(() => new ReferenceSymbol(Symbol("A"))).not.toThrow();
  });
});

test("#isNonTerminal", () => {
  const symbol = new ReferenceSymbol("A");

  const result = symbol.isNonTerminal();

  expect(result).toBe(true);
});

describe("#toKeyString", () => {
  test("文字列", () => {
    const symbol = new ReferenceSymbol("A");

    const result = symbol.toKeyString();

    expect(result).toBe('r "A"');
  });

  test("シンボル", () => {
    const symbol = Symbol("A");
    const nonTermSymbol = new ReferenceSymbol(symbol);

    const result = nonTermSymbol.toKeyString();

    expect(result).toBe(symbol);
  });
});

describe("#toString", () => {
  test("文字列", () => {
    const symbol = new ReferenceSymbol("A");

    const result = symbol.toString();

    expect(result).toBe("rule(A)");
  });

  test("シンボル", () => {
    const symbol = new ReferenceSymbol(Symbol("A"));

    const result = symbol.toString();

    expect(result).toBe("rule(Symbol(A))");
  });
});

describe("#equal", () => {
  test("同じクラスで同じ文字列", () => {
    const symbol1 = new ReferenceSymbol("A");
    const symbol2 = new ReferenceSymbol("A");

    const result = symbol1.equals(symbol2);

    expect(result).toBe(true);
  });

  test("同じクラスで同じシンボル", () => {
    const symbol = Symbol("A");
    const symbol1 = new ReferenceSymbol(symbol);
    const symbol2 = new ReferenceSymbol(symbol);

    const result = symbol1.equals(symbol2);

    expect(result).toBe(true);
  });

  test("同じクラスで違う文字列", () => {
    const symbol1 = new ReferenceSymbol("A");
    const symbol2 = new ReferenceSymbol("B");

    const result = symbol1.equals(symbol2);

    expect(result).toBe(false);
  });

  test("違うクラス", () => {
    const symbol1 = new ReferenceSymbol("A");
    const symbol2 = new WordSymbol("word", "word");

    const result = symbol1.equals(symbol2);

    expect(result).toBe(false);
  });
});
