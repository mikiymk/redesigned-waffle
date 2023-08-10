import { expect, test } from "vitest";

import { generateLRParser } from "@/lib/main";
import { TokenReaderGen } from "@/lib/reader/token-reader";
import { empty, reference, rule, word } from "@/lib/rules/define-rules";

import type { Tree, TreeBranch } from "@/lib/parser/tree";

type JsonValue = null | boolean | number | string | JsonValue[] | { [x: string]: JsonValue };

const reader = new TokenReaderGen([
  ["digit", "[0-9]"],
  ["dot", "."],
]);

const parser = generateLRParser<JsonValue>([
  rule(
    "number",
    [reference("integer"), reference("fractional")],
    ([integer, fractional]) => (tree(integer).processed as number) + (tree(fractional).processed as number),
  ),

  rule("integer", [word("digit")], ([digit]) => Number.parseInt(digit as string)),

  rule("fractional", [empty], (_) => 0),
  rule("fractional", [word("dot", "."), word("digit")], ([_, digit]) => Number.parseInt(digit as string) / 10),
]);

parser.table.printDebug();

const parseJson = (jsonString: string) => {
  const [ok, result] = parser.parse(reader.reader(jsonString));

  if (!ok) {
    throw result;
  }

  log(result);

  return typeof result === "string" ? result : result.processed;
};

const log = <T>(tree: Tree<T>, ind = 0) => {
  const indentString = " ".repeat(ind);
  if (typeof tree === "string") {
    console.log(indentString, tree);
  } else {
    console.log(indentString, "index:", tree.index);
    console.log(indentString, "children:");
    for (const child of tree.children) {
      log(child, ind + 1);
    }
    console.log(indentString, "processed:", tree.processed);
  }
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
  const result = parseJson(source);

  expect(result).toBe(expected);
});

const errors = [
  ["リテラル以外の文字列", "foo"],
  ["ゼロ始まりの数字", "012"],
];

test.each(errors)("parse failed with %s", (_, source) => {
  expect(() => parseJson(source)).toThrow();
});
