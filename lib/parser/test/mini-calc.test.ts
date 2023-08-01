import { expect, test } from "vitest";

import { generateLRParser } from "@/lib/main";
import { TokenReaderGen } from "@/lib/reader/token-reader";
import { reference, rule, word } from "@/lib/rules/define-rules";

import type { Tree, TreeBranch } from "@/lib/parser/tree";

const reader = new TokenReaderGen([
  ["token", "[()+*]"],
  ["num", "[01]"],
]);

const parser = generateLRParser<number>([
  rule("calc", [reference("add")], ([add]) => tree(add).processed),
  rule(
    "add",
    [reference("add"), word("token", "+"), reference("mul")],
    ([add, _, mul]) => tree(add).processed * tree(mul).processed,
  ),
  rule("add", [reference("mul")], ([mul]) => tree(mul).processed),
  rule(
    "mul",
    [reference("mul"), word("token", "*"), reference("expr")],
    ([mul, _, expr]) => tree(mul).processed * tree(expr).processed,
  ),
  rule("mul", [reference("expr")], ([expr]) => tree(expr).processed),
  rule("expr", [word("token", "("), reference("add"), word("token", ")")], ([_, add]) => tree(add).processed),
  rule("expr", [reference("num")], ([number]) => tree(number).processed),
  rule("num", [word("num", "0")], () => 0),
  rule("num", [word("num", "1")], () => 1),
]);

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

const cases: [string, number][] = [
  ["0", 0],
  ["1", 1],
  ["1+0", 1],
  ["1+1", 2],
  ["(1)", 1],
  ["(1+1)", 2],
  ["1*1", 1],
  ["1*0", 0],
  ["1+1*1", 2],
  ["1*1+1*1", 2],
  ["(1+1)*(1+1)", 4],
];

test.each(cases)("parse %s = %d", (source, expected) => {
  const result = parseJson(source);

  expect(result).toBe(expected);
});

const errors = [
  ["no in token", "a"],
  ["no pair parens", "(1"],
  ["unary operator 1", "1+"],
  ["unary operator 2", "0*"],
];

test.each(errors)("parse failed with %s", (_, source) => {
  expect(() => parseJson(source)).toThrow();
});
