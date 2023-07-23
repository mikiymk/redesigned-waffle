import { describe, expect, test } from "vitest";

import { primitiveToString } from "../primitive-to-string";

describe("文字列", () => {
  const cases: [string, string][] = [
    ["", '""'],
    ["abc", '"abc"'],
    ['""', '"\\"\\""'],
    ["\\u1234", '"\\\\u1234"'],
  ];

  test.each(cases)("%s の文字列化", (source, expected) => {
    const result = primitiveToString(source);

    expect(result).toBe(expected);
  });
});

describe("数値", () => {
  const cases: [number | bigint, string][] = [
    [0, "0"],
    [-0, "0"],
    [123, "123"],
    [123n, "123n"],
    [1.23, "1.23"],
    [1.23e20, "123000000000000000000"],
  ];

  test.each(cases)("%s の文字列化", (source, expected) => {
    const result = primitiveToString(source);

    expect(result).toBe(expected);
  });
});

describe("シンボル", () => {
  const cases: [symbol, string][] = [
    [Symbol(""), 'Symbol("")'],
    [Symbol("abc"), 'Symbol("abc")'],
    [Symbol('") Symbol("'), 'Symbol("\\") Symbol(\\"")'],
  ];

  test.each(cases)("%s の文字列化", (source, expected) => {
    const result = primitiveToString(source);

    expect(result).toBe(expected);
  });
});

describe("その他の値", () => {
  const cases: [boolean | null | undefined, string][] = [
    // eslint-disable-next-line unicorn/no-null
    [null, "null"],
    [undefined, "undefined"],
    [true, "true"],
    [false, "false"],
  ];

  test.each(cases)("%s の文字列化", (source, expected) => {
    const result = primitiveToString(source);

    expect(result).toBe(expected);
  });
});
