import { expect, test } from "vitest";

import { generateLRParser } from "@/lib/main";
import { TokenReaderGen } from "@/lib/reader/token-reader";
import { empty, reference, rule, word } from "@/lib/rules/define-rules";

import type { Tree, TreeBranch } from "@/lib/parser/tree";

type JsonValue = null | boolean | number | string | JsonValue[] | { [x: string]: JsonValue };

const reader = new TokenReaderGen([
  ["literal", "true|false|null"],
  ["operator", String.raw`[-.eE+[\],{}:]`],
  ["zero-start-digits", "0[0-9]+"],
  ["digits", "[1-9][0-9]*"],
  ["zero", "0"],
  ["string", String.raw`"([^\\"]|\\[\\"/bfnrt]|\\u[0-9a-fA-F]{4})*"`],
  ["ws", "[\u0020\u000A\u000D\u0009]+"],
]);

const parser = generateLRParser<JsonValue>([
  rule("json", [reference("element")], ([add]) => tree(add).processed),

  rule("element", [reference("ws"), reference("value"), reference("ws")], ([_, value]) => tree(value).processed),

  rule("value", [reference("object")], ([string]) => tree(string).processed),
  rule("value", [reference("array")], ([string]) => tree(string).processed),
  rule("value", [reference("string")], ([string]) => tree(string).processed),
  rule("value", [reference("number")], ([number]) => tree(number).processed),
  rule("value", [word("literal", "true")], (_) => true),
  rule("value", [word("literal", "false")], (_) => false),
  // eslint-disable-next-line unicorn/no-null
  rule("value", [word("literal", "null")], (_) => null),

  rule("object", [word("operator", "{"), reference("ws"), word("operator", "}")], (_) => ({})),
  rule("object", [word("operator", "{"), reference("members"), word("operator", "}")], ([_, members]) =>
    Object.fromEntries(tree(members).processed as [string, JsonValue][]),
  ),

  rule("members", [reference("member")], ([member]) => [tree(member).processed]),
  rule("members", [reference("member"), word("operator", ","), reference("members")], ([member, _, members]) => [
    tree(member).processed,
    ...(tree(members).processed as JsonValue[]),
  ]),

  rule(
    "member",
    [reference("ws"), reference("string"), reference("ws"), word("operator", ":"), reference("element")],
    ([_, key, _1, _2, value]) => [tree(key).processed, tree(value).processed],
  ),

  rule("array", [word("operator", "["), reference("ws"), word("operator", "]")], (_) => []),
  rule(
    "array",
    [word("operator", "["), reference("elements"), word("operator", "]")],
    ([_, elements]) => tree(elements).processed,
  ),

  rule("elements", [reference("element")], ([element]) => [tree(element).processed]),
  rule("elements", [reference("element"), word("operator", ","), reference("elements")], ([element, _, elements]) => [
    tree(element).processed,
    ...(tree(elements).processed as JsonValue[]),
  ]),

  rule("string", [word("string")], ([string]) => {
    const s = string as string;

    return s
      .replaceAll(String.raw`\b`, "\b")
      .replaceAll(String.raw`\f`, "\f")
      .replaceAll(String.raw`\n`, "\n")
      .replaceAll(String.raw`\r`, "\r")
      .replaceAll(String.raw`\t`, "\t")
      .replaceAll(/\\u[\dA-Fa-f]{4}/g, (s) => String.fromCodePoint(Number.parseInt(s.slice(2), 16)))
      .replaceAll(/\\["/\\]/g, (s) => s.slice(1))
      .slice(1, -1);
  }),

  rule(
    "number",
    [reference("integer"), reference("fractional"), reference("exponent")],
    ([integer, fractional, exponent]) =>
      ((tree(integer).processed as number) + (tree(fractional).processed as number)) *
      10 ** (tree(exponent).processed as number),
  ),

  rule("integer", [word("zero")], ([zero]) => Number.parseInt(zero as string)),
  rule("integer", [word("digits")], ([digits]) => Number.parseInt(digits as string)),

  rule("fractional", [empty], (_) => 0),
  rule("fractional", [word("operator", "."), reference("digits")], ([_, digits]) => {
    const n = Number.parseInt(tree(digits).processed as string);
    return n === 0 ? 0 : n / 10 ** (Math.floor(Math.log10(n)) + 1);
  }),

  rule("exponent", [empty], (_) => 0),
  rule("exponent", [word("operator", "e"), reference("sign"), reference("digits")], ([_, sign, digits]) => {
    const n = Number.parseInt(tree(digits).processed as string);

    return (tree(sign).processed as number) * n;
  }),
  rule("exponent", [word("operator", "E"), reference("sign"), reference("digits")], ([_, sign, digits]) => {
    const n = Number.parseInt(tree(digits).processed as string);

    return (tree(sign).processed as number) * n;
  }),

  rule("digits", [word("zero-start-digits")], ([digits]) => digits as string),
  rule("digits", [word("digits")], ([digits]) => digits as string),
  rule("digits", [word("zero")], ([digits]) => digits as string),

  rule("sign", [empty], (_) => 1),
  rule("sign", [word("operator", "+")], (_) => 1),
  rule("sign", [word("operator", "-")], (_) => -1),

  rule("ws", [empty], (_) => 0),
  rule("ws", [word("ws")], (_) => 0),
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
  }
  if (typeof tree === "string") {
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

  ["1e2", 100],
  ["123E45", 123e45],
  ["12e+34", 12e34],
  ["12E-34", 12e-34],

  ["1.23E45", 1.23e45],

  ['""', ""],
  ['"abc"', "abc"],

  [String.raw`"\""`, '"'],
  [String.raw`"\\"`, "\\"],
  [String.raw`"\/"`, "/"],
  [String.raw`"\b"`, "\b"],
  [String.raw`"\f"`, "\f"],
  [String.raw`"\n"`, "\n"],
  [String.raw`"\r"`, "\r"],
  [String.raw`"\t"`, "\t"],
  [String.raw`"\u2bc1"`, "⯁"],
  [String.raw`"\u2BC1"`, "⯁"],

  ["[]", []],
  ["[  ]", []],
  ["[1]", [1]],
  [" [ 1 ] ", [1]],
  ['[1,"a",false]', [1, "a", false]],
  [' [ 1 , "a" , false ] ', [1, "a", false]],

  ["{}", {}],
  [" {  } ", {}],
  ['{"a":5}', { a: 5 }],
  [' { "a" : 5 } ', { a: 5 }],
  ['{"a":5,"b":"foo","c":true}', { a: 5, b: "foo", c: true }],
  [' { "a" : 5 , "b" : "foo" , "c" : true } ', { a: 5, b: "foo", c: true }],
];

test.each(cases)("parse %s = %j", (source, expected) => {
  const result = parseJson(source);

  expect(result).toStrictEqual(expected);
});

const errors = [
  ["リテラル以外の文字列", "foo"],
  ["ゼロ始まりの数字", "012"],
  ["シングルクオートで囲まれた文字列", "'abc'"],
];

test.each(errors)("%s は構文解析に失敗します。", (_, source) => {
  expect(() => parseJson(source)).toThrow();
});
