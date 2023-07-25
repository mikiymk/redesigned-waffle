import { describe, expect, test } from "vitest";

import { empty, equalsRule, reference, rule, word } from "../define-rules";

describe("ルールを作成する", () => {
  test("トークンのあるルール", () => {
    const expected = ["rule name", [word("word", "1"), reference("expression")]];
    const result = rule("rule name", [word("word", "1"), reference("expression")]);

    expect(result).toStrictEqual(expected);
  });

  test("空文字トークンのみのルール", () => {
    const expected = ["rule name", [empty]];
    const result = rule("rule name", [empty]);

    expect(result).toStrictEqual(expected);
  });

  test("空文字列の名前のルール", () => {
    expect(() => rule("", [word("word", "1"), reference("expression")])).toThrow();
  });

  test("トークンのないルール", () => {
    expect(() => rule("rule name", [])).toThrow();
  });

  test("空文字トークンのあるルール", () => {
    expect(() => rule("rule name", [word("word", "1"), empty, reference("expression")])).toThrow();
  });
});

describe("ルールを比較する", () => {
  test("同じルール", () => {
    const rule1 = rule("rule name", [word("word", "1"), reference("expression")]);
    const rule2 = rule("rule name", [word("word", "1"), reference("expression")]);

    const result = equalsRule(rule1, rule2);

    expect(result).toBe(true);
  });

  test("違うルール名", () => {
    const rule1 = rule("rule name", [word("word", "1"), reference("expression")]);
    const rule2 = rule("different name", [word("word", "1"), reference("expression")]);

    const result = equalsRule(rule1, rule2);

    expect(result).toBe(false);
  });

  test("違うトークン", () => {
    const rule1 = rule("rule name", [word("word", "1"), reference("expression")]);
    const rule2 = rule("rule name", [word("word", "2"), reference("expression")]);

    const result = equalsRule(rule1, rule2);

    expect(result).toBe(false);
  });
});
