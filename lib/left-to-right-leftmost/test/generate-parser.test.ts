import { describe, expect, test } from "vitest";

import { CharReader } from "@/lib/reader/char-reader";
import { reference, rule, word } from "@/lib/rules/define-rules";

import { generateParser } from "../generate-parser";

import type { Grammar } from "@/lib/rules/define-rules";

const grammar: Grammar<undefined> = [
  rule("start", [reference("S")]),
  rule("S", [reference("F")]),
  rule("S", [word("char", "("), reference("S"), word("char", "+"), reference("F"), word("char", ")")]),
  rule("F", [word("char", "1")]),
];

test("generating parser", () => {
  expect(() => generateParser(grammar)).not.toThrow();
});

describe("parsing", () => {
  const parser = generateParser(grammar);

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
    const source = "(1+)";

    const result = parser.parse(new CharReader(source));

    expect(result).toStrictEqual([
      false,
      new Error('次の入力にマッチするルール(ルール名:"F")が見つかりませんでした。'),
    ]);
  });
});
