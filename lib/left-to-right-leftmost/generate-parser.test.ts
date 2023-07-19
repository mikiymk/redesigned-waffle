import { describe, expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";


import { ParseReader } from "../core/reader";

import { generateParser } from "./generate-parser";

import type { Syntax } from "@/lib/rules/define-rules";

const syntax: Syntax = [
  rule("start", reference("S")),
  rule("S", reference("F")),
  rule("S", word("("), reference("S"), word("+"), reference("F"), word(")")),
  rule("F", word("1")),
];

test("generating parser", () => {
  expect(() => generateParser(syntax)).not.toThrow();
});

describe("parsing", () => {
  const parser = generateParser(syntax);

  test("parse success", () => {
    const source = "(1+1)";

    const result = parser(new ParseReader(source));

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
    const source = "(1+)";

    expect(parser(new ParseReader(source))).toStrictEqual([false, new Error("no rule F matches first char )")]);
  });
});
