import { describe, expect, test } from "vitest";

import { CharReader } from "@/lib/reader/char-reader";
import { reference, rule, word } from "@/lib/rules/define-rules";

import { generateParser } from "../generate-parser";

import type { Syntax } from "@/lib/rules/define-rules";

describe("parsing", () => {
  const syntax: Syntax = [
    rule("start", reference("S")),
    rule("S", reference("F")),
    rule("S", word("("), reference("S"), word("+"), reference("F"), word(")")),
    rule("F", word("1")),
  ];

  test("generating parser", () => {
    expect(() => generateParser(syntax)).not.toThrow();
  });

  test("parse success", () => {
    const parser = generateParser(syntax);
    const source = "(1+1)";

    const result = parser(new CharReader(source));

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
                  },
                ],
              },
              "+",
              {
                index: 3,
                children: ["1"],
              },
              ")",
            ],
          },
        ],
      },
    ]);
  });

  test("parse failure", () => {
    const parser = generateParser(syntax);
    const source = "(1+)";

    expect(parser(new CharReader(source))).toStrictEqual([false, new Error("nomatch input")]);
  });
});

describe("parsing 2", () => {
  const syntax: Syntax = [
    rule("S", reference("E")),
    rule("E", reference("E"), word("*"), reference("B")),
    rule("E", reference("E"), word("+"), reference("B")),
    rule("E", reference("B")),
    rule("B", word("0")),
    rule("B", word("1")),
  ];

  test("generating parser", () => {
    expect(() => generateParser(syntax)).not.toThrow();
  });

  test("parse success", () => {
    const parser = generateParser(syntax);
    const source = "1+1";

    const result = parser(new CharReader(source));

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
                  },
                ],
              },
              "+",
              {
                index: 5,
                children: ["1"],
              },
            ],
          },
        ],
      },
    ]);
  });

  test("parse failure", () => {
    const parser = generateParser(syntax);
    const source = "1+2";

    expect(parser(new CharReader(source))).toStrictEqual([false, new Error("nomatch input")]);
  });
});

describe("parsing 3", () => {
  const syntax: Syntax = [rule("S", reference("E")), rule("E", word("1"), reference("E")), rule("E", word("1"))];

  test("generating parser", () => {
    expect(() => generateParser(syntax)).not.toThrow();
  });

  test("parse success", () => {
    const parser = generateParser(syntax);
    const source = "111";

    const result = parser(new CharReader(source));

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
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  test("parse failure", () => {
    const parser = generateParser(syntax);
    const source = "112";

    expect(parser(new CharReader(source))).toStrictEqual([false, new Error("nomatch input")]);
  });
});

describe("parsing 4", () => {
  const syntax: Syntax = [
    rule("S", reference("E")),
    rule("E", reference("A"), word("1")),
    rule("E", reference("B"), word("2")),
    rule("A", word("1")),
    rule("B", word("1")),
  ];

  test("generating parser", () => {
    expect(() => generateParser(syntax)).not.toThrow();
  });

  test("parse success", () => {
    const parser = generateParser(syntax);
    const source = "12";

    const result = parser(new CharReader(source));

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
              },
              "2",
            ],
          },
        ],
      },
    ]);
  });

  test("parse failure", () => {
    const parser = generateParser(syntax);
    const source = "10";

    expect(parser(new CharReader(source))).toStrictEqual([false, new Error("nomatch input")]);
  });
});
