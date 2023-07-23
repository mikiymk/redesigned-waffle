import { describe, expect, test } from "vitest";

import { ReferenceToken } from "../reference-token";
import { WordToken } from "../word-token";

describe("#constructor", () => {
  test("文字列", () => {
    expect(() => new ReferenceToken("A")).not.toThrow();
  });

  test("空文字列", () => {
    expect(() => new ReferenceToken("")).toThrow();
  });

  test("シンボル", () => {
    expect(() => new ReferenceToken(Symbol("A"))).not.toThrow();
  });
});

test("#isNonTerminal", () => {
  const token = new ReferenceToken("A");

  const result = token.isNonTerminal();

  expect(result).toBe(true);
});

describe("#toKeyString", () => {
  test("文字列", () => {
    const token = new ReferenceToken("A");

    const result = token.toKeyString();

    expect(result).toBe('r "A"');
  });

  test("シンボル", () => {
    const symbol = Symbol("A");
    const token = new ReferenceToken(symbol);

    const result = token.toKeyString();

    expect(result).toBe(symbol);
  });
});

describe("#toString", () => {
  test("文字列", () => {
    const token = new ReferenceToken("A");

    const result = token.toString();

    expect(result).toBe("rule(A)");
  });

  test("シンボル", () => {
    const token = new ReferenceToken(Symbol("A"));

    const result = token.toString();

    expect(result).toBe("rule(Symbol(A))");
  });
});

describe("#equal", () => {
  test("同じクラスで同じ文字列", () => {
    const token1 = new ReferenceToken("A");
    const token2 = new ReferenceToken("A");

    const result = token1.equals(token2);

    expect(result).toBe(true);
  });

  test("同じクラスで同じシンボル", () => {
    const symbol = Symbol("A");
    const token1 = new ReferenceToken(symbol);
    const token2 = new ReferenceToken(symbol);

    const result = token1.equals(token2);

    expect(result).toBe(true);
  });

  test("同じクラスで違う文字列", () => {
    const token1 = new ReferenceToken("A");
    const token2 = new ReferenceToken("B");

    const result = token1.equals(token2);

    expect(result).toBe(false);
  });

  test("違うクラス", () => {
    const token1 = new ReferenceToken("A");
    const token2 = new WordToken("word");

    const result = token1.equals(token2);

    expect(result).toBe(false);
  });
});
