import { describe, expect, test } from "vitest";

import { CharReader } from "@/lib/reader/char-reader";
import { reference, rule, word } from "@/lib/rules/define-rules";

import { generateParser } from "../generate-parser";

import type { Syntax } from "@/lib/rules/define-rules";

describe("parsing", () => {
  const syntax: Syntax<undefined> = [
    rule("start", [reference("S")]),
    rule("S", [reference("F")]),
    rule("S", [word("char", "("), reference("S"), word("char", "+"), reference("F"), word("char", ")")]),
    rule("F", [word("char", "1")]),
  ];

  test("generating parser", () => {
    expect(() => generateParser(syntax)).not.toThrow();
  });

  test("parse success", () => {
    const parser = generateParser(syntax);
    const source = "(1+1)";

    const result = parser.parse(new CharReader(source));

    expect(result).toStrictEqual([
      true,
      {
        index: 0,
        children: [
          {
            index: 2,
            children: [
              "(",
              {
                index: 1,
                children: [
                  {
                    index: 3,
                    children: ["1"],
                    processed: undefined,
                  },
                ],
                processed: undefined,
              },
              "+",
              {
                index: 3,
                children: ["1"],
                processed: undefined,
              },
              ")",
            ],
            processed: undefined,
          },
        ],
        processed: undefined,
      },
    ]);
  });

  test("parse failure", () => {
    const parser = generateParser(syntax);
    const source = "(1+)";

    expect(parser.parse(new CharReader(source))).toStrictEqual([
      false,
      new Error("パース中にエラーが発生しました。 (, 1: [ 3: [ 1 ] ], +"),
    ]);
  });
});

describe("parsing 2", () => {
  const syntax: Syntax<undefined> = [
    rule("S", [reference("E")]),
    rule("E", [reference("E"), word("char", "*"), reference("B")]),
    rule("E", [reference("E"), word("char", "+"), reference("B")]),
    rule("E", [reference("B")]),
    rule("B", [word("char", "0")]),
    rule("B", [word("char", "1")]),
  ];

  test("generating parser", () => {
    expect(() => generateParser(syntax)).not.toThrow();
  });

  test("parse success", () => {
    const parser = generateParser(syntax);
    const source = "1+1";

    const result = parser.parse(new CharReader(source));

    expect(result).toStrictEqual([
      true,
      {
        index: 0,
        children: [
          {
            index: 2,
            children: [
              {
                index: 3,
                children: [
                  {
                    index: 5,
                    children: ["1"],
                    processed: undefined,
                  },
                ],
                processed: undefined,
              },
              "+",
              {
                index: 5,
                children: ["1"],
                processed: undefined,
              },
            ],
            processed: undefined,
          },
        ],
        processed: undefined,
      },
    ]);
  });

  test("parse failure", () => {
    const parser = generateParser(syntax);
    const source = "1+2";

    expect(parser.parse(new CharReader(source))).toStrictEqual([
      false,
      new Error("パース中にエラーが発生しました。 3: [ 5: [ 1 ] ], +"),
    ]);
  });
});

describe("parsing 3", () => {
  const syntax: Syntax<undefined> = [
    rule("S", [reference("E")]),
    rule("E", [word("char", "1"), reference("E")]),
    rule("E", [word("char", "1")]),
  ];

  test("generating parser", () => {
    expect(() => generateParser(syntax)).not.toThrow();
  });

  test("parse success", () => {
    const parser = generateParser(syntax);
    const source = "111";

    const result = parser.parse(new CharReader(source));

    expect(result).toStrictEqual([
      true,
      {
        index: 0,
        children: [
          {
            index: 1,
            children: [
              "1",
              {
                index: 1,
                children: [
                  "1",
                  {
                    index: 2,
                    children: ["1"],
                    processed: undefined,
                  },
                ],
                processed: undefined,
              },
            ],
            processed: undefined,
          },
        ],
        processed: undefined,
      },
    ]);
  });

  test("parse failure", () => {
    const parser = generateParser(syntax);
    const source = "112";

    expect(parser.parse(new CharReader(source))).toStrictEqual([
      false,
      new Error("パース中にエラーが発生しました。 1, 1"),
    ]);
  });
});

describe("parsing 4", () => {
  const syntax: Syntax<undefined> = [
    rule("S", [reference("E")]),
    rule("E", [reference("A"), word("char", "1")]),
    rule("E", [reference("B"), word("char", "2")]),
    rule("A", [word("char", "1")]),
    rule("B", [word("char", "1")]),
  ];

  test("generating parser", () => {
    expect(() => generateParser(syntax)).not.toThrow();
  });

  test("parse success", () => {
    const parser = generateParser(syntax);
    const source = "12";

    const result = parser.parse(new CharReader(source));

    expect(result).toStrictEqual([
      true,
      {
        index: 0,
        children: [
          {
            index: 2,
            children: [
              {
                index: 4,
                children: ["1"],
                processed: undefined,
              },
              "2",
            ],
            processed: undefined,
          },
        ],
        processed: undefined,
      },
    ]);
  });

  test("parse failure", () => {
    const parser = generateParser(syntax);
    const source = "10";

    expect(parser.parse(new CharReader(source))).toStrictEqual([
      false,
      new Error("パース中にエラーが発生しました。 1"),
    ]);
  });
});
