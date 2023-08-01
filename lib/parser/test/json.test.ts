import { expect, test } from "vitest";

import { generateLRParser } from "@/lib/main";
import { TokenReaderGen } from "@/lib/reader/token-reader";
import { empty, reference, rule, word } from "@/lib/rules/define-rules";

import type { Tree, TreeBranch } from "@/lib/parser/tree";

const reader = new TokenReaderGen([
  ["true", "true"],
  ["false", "false"],
  ["null", "null"],
  ["{", "{"],
  ["}", "}"],
  ["[", "\\["],
  ["]", "]"],
  [",", ","],
  [":", ":"],
  [".", "."],
  ["-", "-"],
  ["0", "0"],
  ["onenine", "[1-9]"],
  ["character", '[ -!#-[\\]-\uFFFF]|\\["\\/bfnrt]|\\u[0-9a-fA-F]{4}'],
  ["ws", "[ \t\r\n]+"],
]);

const parser = generateLRParser<number>([
  rule("json", [reference("element")], ([add]) => tree(add).processed),

  rule("value", [reference("object")], ([add]) => tree(add).processed),
  rule("value", [reference("array")], ([add]) => tree(add).processed),
  rule("value", [reference("string")], ([add]) => tree(add).processed),
  rule("value", [reference("number")], ([add]) => tree(add).processed),
  rule("value", [word("true")], ([add]) => tree(add).processed),
  rule("value", [word("false")], ([add]) => tree(add).processed),
  rule("value", [word("null")], ([add]) => tree(add).processed),

  rule("object", [word("{"), reference("ws"), word("}")], ([add]) => tree(add).processed),
  rule("object", [word("{"), reference("members"), word("}")], ([add]) => tree(add).processed),

  rule("members", [reference("member")], ([add]) => tree(add).processed),
  rule("members", [reference("member"), word(","), reference("members")], ([add]) => tree(add).processed),

  rule(
    "member",
    [reference("ws"), reference("string"), reference("ws"), word(":"), reference("element")],
    ([add]) => tree(add).processed,
  ),

  rule("array", [word("["), reference("ws"), word("]")], ([add]) => tree(add).processed),
  rule("array", [word("["), reference("elements"), word("]")], ([add]) => tree(add).processed),

  rule("elements", [reference("element")], ([add]) => tree(add).processed),
  rule("elements", [reference("element"), word(","), reference("elements")], ([add]) => tree(add).processed),

  rule("element", [reference("ws"), reference("value"), reference("ws")], ([add]) => tree(add).processed),

  rule("string", [word('"'), reference("characters"), word('"')], ([add]) => tree(add).processed),

  rule("characters", [empty], ([add]) => tree(add).processed),
  rule("characters", [reference("character"), reference("characters")], ([add]) => tree(add).processed),

  rule("character", [word("character")], ([add]) => tree(add).processed),

  rule("number", [reference("integer"), reference("fraction"), reference("exponent")], ([add]) => tree(add).processed),

  rule("integer", [reference("digit")], ([add]) => tree(add).processed),
  rule("integer", [word("onenine"), reference("digits")], ([add]) => tree(add).processed),
  rule("integer", [word("-"), reference("digit")], ([add]) => tree(add).processed),
  rule("integer", [word("-"), word("onenine"), reference("digits")], ([add]) => tree(add).processed),

  rule("digits", [reference("digit")], ([add]) => tree(add).processed),
  rule("digits", [reference("digit"), reference("digits")], ([add]) => tree(add).processed),

  rule("digit", [word("0")], ([add]) => tree(add).processed),
  rule("digit", [word("onenine")], ([add]) => tree(add).processed),

  rule("fraction", [empty], ([add]) => tree(add).processed),
  rule("fraction", [word("."), reference("digits")], ([add]) => tree(add).processed),

  rule("exponent", [empty], ([add]) => tree(add).processed),
  rule("exponent", [word("E"), reference("sign"), reference("digits")], ([add]) => tree(add).processed),
  rule("exponent", [word("e"), reference("sign"), reference("digits")], ([add]) => tree(add).processed),

  rule("sign", [empty], ([add]) => tree(add).processed),
  rule("sign", [word("+")], ([add]) => tree(add).processed),
  rule("sign", [word("-")], ([add]) => tree(add).processed),

  rule("ws", [word("ws")], ([add]) => tree(add).processed),
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

const cases: [string, unknown][] = [
  ["false", false],
  ["true", true],
  // eslint-disable-next-line unicorn/no-null
  ["null", null],
  ["1+1", 2],
  ["(1)", 1],
  ["(1+1)", 2],
  ["1*1", 1],
  ["1*0", 0],
  ["1+1*1", 2],
  ["1*1+1*1", 2],
  ["(1+1)*(1+1)", 4],
];

test.each(cases)("parse %s = %j", (source, expected) => {
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
