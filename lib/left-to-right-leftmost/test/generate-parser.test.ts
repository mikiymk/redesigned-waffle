import { describe, expect, test } from "vitest";

import { CharReader } from "@/lib/reader/char-reader";
import { reference, rule, word } from "@/lib/rules/define-rules";

import { generateParser } from "../generate-parser";

import type { Syntax } from "@/lib/rules/define-rules";

const syntax: Syntax = [
  rule("start", reference("S")),
  rule("S", reference("F")),
  rule("S", word("word", "("), reference("S"), word("word", "+"), reference("F"), word("word", ")")),
  rule("F", word("word", "1")),
];

test("generating parser", () => {
  expect(() => generateParser(syntax)).not.toThrow();
});

describe("parsing", () => {
  const parser = generateParser(syntax);

  test("parse success", () => {
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

    const result = parser.parse(new CharReader(source));

    expect(result).toStrictEqual([false, new Error('no rule "F" matches first char )')]);
  });
});
