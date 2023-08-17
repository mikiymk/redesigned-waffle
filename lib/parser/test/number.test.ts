import { expect, test } from "vitest";

import { generateLRParser } from "@/lib/main";
import { TokenReaderGen } from "@/lib/reader/token-reader";
import { empty, reference, rule, word } from "@/lib/rules/define-rules";

import type { Tree, TreeBranch } from "@/lib/parser/tree";

const reader = new TokenReaderGen([
  ["digit", "[0-9]"],
  ["dot", "."],
]);

const parser = generateLRParser<number>([
  rule(
    "number",
    [reference("integer"), reference("fractional")],
    ([integer, fractional]) => tree(integer).processed + tree(fractional).processed,
  ),

  rule("integer", [word("digit")], ([digit]) => Number.parseInt(digit as string)),

  rule("fractional", [empty], (_) => 0),
  rule("fractional", [word("dot", "."), word("digit")], ([_, digit]) => Number.parseInt(digit as string) / 10),
]);

const parseNumber = (jsonString: string) => {
  // parser.table.printDebug();

  const [ok, result] = parser.parse(reader.reader(jsonString));

  if (!ok) {
    throw result;
  }

  return typeof result === "string" ? result : result.processed;
};

const tree = <T>(tree: Tree<T> | undefined): TreeBranch<T> => {
  if (tree === undefined) {
    throw new TypeError("Tree is undefined");
  } else if (typeof tree === "string") {
    throw new TypeError("Tree is string");
  }

  return tree;
};

const cases: [string, unknown][] = [
  ["0", 0],
  ["1", 1],
  ["2", 2],

  ["0.1", 0.1],
  ["2.5", 2.5],
];

test.each(cases)("parse %s = %j", (source, expected) => {
  const result = parseNumber(source);

  expect(result).toBe(expected);
});

const errors = [
  ["リテラル以外の文字列", "foo"],
  ["ゼロ始まりの数字", "012"],
];

test.each(errors)("parse failed with %s", (_, source) => {
  expect(() => parseNumber(source)).toThrow();
});
