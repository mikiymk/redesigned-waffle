import { expect, test } from "vitest";

import { generateLRParser } from "@/lib/main";
import { TokenReaderGen } from "@/lib/reader/token-reader";
import { reference, rule, word } from "@/lib/rules/define-rules";

import type { Tree, TreeBranch } from "@/lib/parser/tree";

const reader = new TokenReaderGen([
  ["token", "[()+*/-]"],
  ["num", "[0-9]"],
]);

const parser = generateLRParser<number>([
  rule("mini-calc", [reference("addition")], ([a]) => tree(a).processed),

  rule(
    "addition",
    [reference("addition"), word("token", "+"), reference("multiplication")],
    ([a, _, m]) => tree(a).processed + tree(m).processed,
  ),
  rule(
    "addition",
    [reference("addition"), word("token", "-"), reference("multiplication")],
    ([a, _, m]) => tree(a).processed - tree(m).processed,
  ),
  rule("addition", [reference("multiplication")], ([mul]) => tree(mul).processed),

  rule(
    "multiplication",
    [reference("multiplication"), word("token", "*"), reference("parentheses")],
    ([m, _, p]) => tree(m).processed * tree(p).processed,
  ),
  rule(
    "multiplication",
    [reference("multiplication"), word("token", "/"), reference("parentheses")],
    ([m, _, p]) => tree(m).processed / tree(p).processed,
  ),
  rule("multiplication", [reference("parentheses")], ([p]) => tree(p).processed),

  rule("parentheses", [word("token", "("), reference("addition"), word("token", ")")], ([_, a]) => tree(a).processed),
  rule("parentheses", [reference("number")], ([n]) => tree(n).processed),

  rule("number", [word("num")], ([n]) => Number.parseInt(n as string)),
]);

const parseJson = (jsonString: string) => {
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

const cases: [string, number][] = [
  // 単純な数字
  ["0", 0],
  ["1", 1],

  // 足し算と引き算
  ["1+0", 1],
  ["1+1+2", 4],
  ["2-1", 1],

  // 掛け算と割り算
  ["1*0", 0],
  ["1*2*3", 6],
  ["4/2", 2],

  // +-と*/の複合
  ["1+1*2", 3],
  ["1*2+3*4", 14],

  // かっこの優先順位
  ["(1)", 1],
  ["(1+1)", 2],
  ["(1+1)*(1+1)", 4],
];

test.each(cases)("パース成功 %s = %d", (source, expected) => {
  const result = parseJson(source);

  expect(result).toBe(expected);
});

const errors = [
  ["トークンではない文字", "a"],
  ["対応しないかっこ", "(1"],
  ["対応しない演算子１", "1+"],
  ["対応しない演算子２", "0*"],
];

test.each(errors)("パース失敗 %s", (_, source) => {
  expect(() => parseJson(source)).toThrow();
});
