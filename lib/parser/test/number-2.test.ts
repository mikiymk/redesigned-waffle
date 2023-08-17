import { describe, expect, test } from "vitest";

import { closure } from "@/lib/left-to-right-rightmost/closure";
import { groupByNextToken } from "@/lib/left-to-right-rightmost/group-next-token";
import { LR0Item } from "@/lib/left-to-right-rightmost/lr0-item";
import { ParseTableRow } from "@/lib/left-to-right-rightmost/parse-table-row";
import { generateLRParser } from "@/lib/main";
import { TokenReaderGen } from "@/lib/reader/token-reader";
import { empty, eof, reference, rule, word } from "@/lib/rules/define-rules";
import { getFirstSet, getFirstSetList } from "@/lib/token-set/first-set";
import { ObjectSet } from "@/lib/util/object-set";

import type { Tree, TreeBranch } from "@/lib/parser/tree";
import type { Syntax } from "@/lib/rules/define-rules";

// (0) S -> N
// (1) N -> I
// (2) N -> I F
// (3) I -> dig
// (4) F -> dot dig
const grammar: Syntax<number> = [
  rule("start", [reference("num")], ([number]) => tree(number).processed),

  rule("num", [reference("int")], ([integer]) => tree(integer).processed),
  rule(
    "num",
    [reference("int"), reference("frac")],
    ([integer, fractional]) => tree(integer).processed + tree(fractional).processed,
  ),

  rule("int", [word("dig")], ([digit]) => Number.parseInt(digit as string)),

  rule("frac", [word("dot", "."), word("dig")], ([_, digit]) => Number.parseInt(digit as string) / 10),
];

const parseJson = (jsonString: string) => {
  const reader = new TokenReaderGen([
    ["dig", "[0-9]"],
    ["dot", "."],
  ]);

  const parser = generateLRParser<number>(grammar);

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

describe("処理の流れで調べる", () => {
  test("最初のルールがある", () => {
    expect(grammar[0]).toBeDefined();
  });

  test("最初のルールをLRアイテムに変換する", () => {
    const result = new LR0Item(grammar[0]!, 0, [eof]);

    expect(result).toStrictEqual(new LR0Item(rule("start", [reference("num")]), 0, [eof]));
  });

  test("アイテムの後ろの部分のFirst集合を求める", () => {
    const firstSetList = getFirstSetList(grammar);

    {
      const item = new LR0Item(grammar[0]!, 0, [eof]);
      const afterNextToken = item.rule.tokens.slice(item.position + 1);

      const result = [...getFirstSet(grammar, firstSetList, afterNextToken)];

      expect(result).toHaveLength(1);
      expect(result[0]).toStrictEqual(empty);
    }

    {
      const item = new LR0Item(grammar[1]!, 0, [eof]);
      const afterNextToken = item.rule.tokens.slice(item.position + 1);

      const result = [...getFirstSet(grammar, firstSetList, afterNextToken)];

      expect(result).toHaveLength(1);
      expect(result[0]).toStrictEqual(empty);
    }

    {
      const item = new LR0Item(grammar[2]!, 0, [eof]);
      const afterNextToken = item.rule.tokens.slice(item.position + 1);

      const result = [...getFirstSet(grammar, firstSetList, afterNextToken)];

      expect(result).toHaveLength(1);
      expect(result[0]).toStrictEqual(word("dot", "."));
    }

    {
      const item = new LR0Item(grammar[3]!, 0, [eof]);
      const afterNextToken = item.rule.tokens.slice(item.position + 1);

      const result = [...getFirstSet(grammar, firstSetList, afterNextToken)];

      expect(result).toHaveLength(1);
      expect(result[0]).toStrictEqual(empty);
    }
  });

  test("最初のアイテムをクロージャ展開する", () => {
    const firstItem = new LR0Item(grammar[0]!, 0, [eof]);

    const result = closure(grammar, firstItem).map((value) => value.toKeyString());

    expect(result).toHaveLength(3);
    expect(result).toContain(new LR0Item(rule<number>("num", [reference("int")]), 0, [eof]).toKeyString());
    expect(result).toContain(
      new LR0Item(rule<number>("num", [reference("int"), reference("frac")]), 0, [eof]).toKeyString(),
    );
    expect(result).toContain(new LR0Item(rule<number>("int", [word("dig")]), 0, [eof, word("dot", ".")]).toKeyString());
  });

  test("最初のアイテムから最初の行を作成する", () => {
    const firstItem = new LR0Item(grammar[0]!, 0, [eof]);

    const result = new ParseTableRow(grammar, [firstItem]);

    expect(result.kernels.size).toBe(1);
    expect(result.kernels.has(new LR0Item(rule<number>("start", [reference("num")]), 0, [eof]))).toBe(true);

    expect(result.additions.size).toBe(3);
    expect(result.additions.has(new LR0Item(rule<number>("num", [reference("int")]), 0, [eof]))).toBe(true);
    expect(
      result.additions.has(new LR0Item(rule<number>("num", [reference("int"), reference("frac")]), 0, [eof])),
    ).toBe(true);
    expect(result.additions.has(new LR0Item(rule<number>("int", [word("dig")]), 0, [eof, word("dot", ".")]))).toBe(
      true,
    );
  });

  test("最初の行のアイテムをグループ分けする", () => {
    const result = groupByNextToken(
      new ObjectSet([
        new LR0Item(rule<number>("start", [reference("num")]), 0, [eof]),
        new LR0Item(rule<number>("num", [reference("int")]), 0, [eof]),
        new LR0Item(rule<number>("num", [reference("int"), reference("frac")]), 0, [eof]),
        new LR0Item(rule<number>("int", [word("dig")]), 0, [eof, word("dot", ".")]),
      ]),
    );

    expect(result).toHaveLength(3);

    expect(result[0]).toStrictEqual([
      reference("num"),
      new ObjectSet([new LR0Item(rule<number>("start", [reference("num")]), 0, [eof])]),
    ]);

    expect(result[1]).toStrictEqual([
      reference("int"),
      new ObjectSet([
        new LR0Item(rule<number>("num", [reference("int")]), 0, [eof]),
        new LR0Item(rule<number>("num", [reference("int"), reference("frac")]), 0, [eof]),
      ]),
    ]);

    expect(result[2]).toStrictEqual([
      word("dig"),
      new ObjectSet([new LR0Item(rule<number>("int", [word("dig")]), 0, [eof, word("dot", ".")])]),
    ]);
  });
});
