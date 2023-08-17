import { expect, test } from "vitest";

import { generateLRParser } from "@/lib/main";
import { TokenReaderGen } from "@/lib/reader/token-reader";
import { empty, reference, rule, word } from "@/lib/rules/define-rules";

import type { Tree, TreeBranch } from "@/lib/parser/tree";

type JsonValue = null | boolean | number | string | JsonValue[] | { [x: string]: JsonValue };

const reader = new TokenReaderGen([
  ["literal", "true|false|null"],
  ["token", "[.]"],
  ["zero-start-digits", "0[0-9]+"],
  ["digits", "[1-9][0-9]*"],
  ["zero", "0"],
]);

const parser = generateLRParser<JsonValue>([
  rule("json", [reference("element")], ([add]) => tree(add).processed),

  rule("element", [reference("value")], ([value]) => tree(value).processed),

  rule("value", [reference("number")], ([number]) => tree(number).processed),
  rule("value", [word("literal", "true")], (_) => true),
  rule("value", [word("literal", "false")], (_) => false),
  // eslint-disable-next-line unicorn/no-null
  rule("value", [word("literal", "null")], (_) => null),

  rule(
    "number",
    [reference("integer"), reference("fractional")],
    ([integer, fractional]) => (tree(integer).processed as number) + (tree(fractional).processed as number),
  ),

  rule("integer", [word("zero")], ([zero]) => Number.parseInt(zero as string)),
  rule("integer", [word("digits")], ([digits]) => Number.parseInt(digits as string)),

  rule("fractional", [empty], (_) => 0),
  rule("fractional", [word("token", "."), reference("digits")], ([_, digits]) => {
    const n = Number.parseInt(tree(digits).processed as string);
    return n === 0 ? 0 : n / 10 ** (Math.floor(Math.log10(n)) + 1);
  }),

  rule("digits", [word("zero-start-digits")], ([digits]) => digits as string),
  rule("digits", [word("digits")], ([digits]) => digits as string),
  rule("digits", [word("zero")], ([digits]) => digits as string),
]);

const parseJson = (jsonString: string) => {
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
  ["false", false],
  ["true", true],
  // eslint-disable-next-line unicorn/no-null
  ["null", null],

  ["0", 0],
  ["1", 1],
  ["123", 123],

  ["0.1", 0.1],
  ["123.456", 123.456],
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
