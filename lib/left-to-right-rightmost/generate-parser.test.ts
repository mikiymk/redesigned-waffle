import { describe, expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { fromString } from "../core/reader";

import { generateParser } from "./generate-parser";

import type { ParseReader } from "../core/reader";
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

  let parser: (pr: ParseReader) => unknown;
  try {
    parser = generateParser(syntax);
  } catch {
    /** @returns zero */
    parser = () => 0;
  }

  test("parse success", () => {
    const source = "(1+1)";

    const result = parser(fromString(source));

    expect(result).toStrictEqual([
      true,
      {
        name: "start",
        children: [
          {
            name: "S",
            children: [
              "(",
              {
                name: "S",
                children: [
                  {
                    name: "F",
                    children: ["1"],
                  },
                ],
              },
              "+",
              {
                name: "F",
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
    const source = "(1+)";

    expect(parser(fromString(source))).toStrictEqual([false, new Error("nomatch input")]);
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

  let parser: (pr: ParseReader) => unknown;
  try {
    parser = generateParser(syntax);
  } catch {
    /** @returns zero */
    parser = () => 0;
  }

  test("parse success", () => {
    const source = "1+1";

    const result = parser(fromString(source));

    expect(result).toStrictEqual([
      true,
      {
        name: "S",
        children: [
          {
            name: "E",
            children: [
              {
                name: "E",
                children: [
                  {
                    name: "B",
                    children: ["1"],
                  },
                ],
              },
              "+",
              {
                name: "B",
                children: ["1"],
              },
            ],
          },
        ],
      },
    ]);
  });

  test("parse failure", () => {
    const source = "1+2";

    expect(parser(fromString(source))).toStrictEqual([false, new Error("nomatch input")]);
  });
});

describe("parsing 3", () => {
  const syntax: Syntax = [rule("S", reference("E")), rule("E", word("1"), reference("E")), rule("E", word("1"))];

  test("generating parser", () => {
    expect(() => generateParser(syntax)).not.toThrow();
  });

  let parser: (pr: ParseReader) => unknown;
  try {
    parser = generateParser(syntax);
  } catch {
    /** @returns zero */
    parser = () => 0;
  }

  test("parse success", () => {
    const source = "111";

    const result = parser(fromString(source));

    expect(result).toStrictEqual([
      true,
      {
        name: "S",
        children: [
          {
            name: "E",
            children: [
              "1",
              {
                name: "E",
                children: [
                  "1",
                  {
                    name: "E",
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
    const source = "112";

    expect(parser(fromString(source))).toStrictEqual([false, new Error("nomatch input")]);
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

  let parser: (pr: ParseReader) => unknown;
  try {
    parser = generateParser(syntax);
  } catch {
    /** @returns zero */
    parser = () => 0;
  }

  test("parse success", () => {
    const source = "12";

    const result = parser(fromString(source));

    expect(result).toStrictEqual([
      true,
      {
        name: "S",
        children: [
          {
            name: "E",
            children: [
              {
                name: "B",
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
    const source = "10";

    expect(parser(fromString(source))).toStrictEqual([false, new Error("nomatch input")]);
  });
});
