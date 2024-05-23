import { describe, expect, test } from "vitest";

import { closure } from "@/lib/left-to-right-rightmost/closure";
import { groupByNextToken } from "@/lib/left-to-right-rightmost/group-next-symbol";
import { LR0Item } from "@/lib/left-to-right-rightmost/lr0-item";
import { ParseTableRow } from "@/lib/left-to-right-rightmost/parse-table-row";
import { generateLRParser } from "@/lib/main";
import { TokenReaderGen } from "@/lib/reader/token-reader";
import { empty, eof, reference, rule, word } from "@/lib/rules/define-rules";
import { getFirstSet, getFirstSetList } from "@/lib/symbol-set/first-set";
import { ObjectSet } from "@/lib/util/object-set";

import type { Tree } from "@/lib/parser/tree";
import type { Grammar } from "@/lib/rules/define-rules";

// (0) Start -> Num
const rule0 = rule<number>("start", [reference("num")], ([number]) => tree(number));
// (1) Num -> Int Frac
const rule1 = rule<number>(
  "num",
  [reference("int"), reference("frac")],
  ([integer, fractional]) => tree(integer) + tree(fractional, 0),
);
// (2) Int -> digit
const rule2 = rule<number>("int", [word("dig")], ([digit]) => Number.parseInt(digit as string));
// (3) Frac ->
const rule3 = rule<number>("frac", [empty], (_) => 0);
// (4) Frac -> . digit
const rule4 = rule<number>("frac", [word("dot"), word("dig")], ([_, digit]) => Number.parseInt(digit as string) / 10);

const grammar: Grammar<number> = [rule0, rule1, rule2, rule3, rule4];

const reader = new TokenReaderGen([
  ["dig", "[0-9]"],
  ["dot", "."],
]);

const parser = generateLRParser(grammar);

const parseNumber = (jsonString: string) => {
  // parser.table.printDebug();

  const [ok, result] = parser.parse(reader.reader(jsonString));

  if (!ok) {
    throw result;
  }

  // _log(result);

  return typeof result === "string" ? result : result.processed;
};

const tree = <T>(tree: Tree<T> | undefined, default_?: T): T => {
  if (tree === undefined) {
    if (default_ === undefined) {
      throw new TypeError("Tree is undefined");
    }
    return default_;
  }
  if (typeof tree === "string") {
    throw new TypeError("Tree is string");
  }

  return tree.processed;
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

describe("処理の流れで調べる", () => {
  test("最初のルールがある", () => {
    expect(grammar[0]).toBeDefined();
  });

  test("最初のルールをLRアイテムに変換する", () => {
    const result = new LR0Item(rule0, 0, [eof]);

    expect(result).toStrictEqual(new LR0Item(rule("start", [reference("num")]), 0, [eof]));
  });

  test("アイテムの後ろの部分のFirst集合を求める", () => {
    const firstSetList = getFirstSetList(grammar);

    {
      const item = new LR0Item(rule0, 0, [eof]);
      const afterNextToken = item.rule.symbols.slice(item.position + 1);

      const result = [...getFirstSet(grammar, firstSetList, afterNextToken)];

      expect(result).toHaveLength(1);
      expect(result[0]).toStrictEqual(empty);
    }

    {
      const item = new LR0Item(rule1, 0, [eof]);
      const afterNextToken = item.rule.symbols.slice(item.position + 1);

      const result = [...getFirstSet(grammar, firstSetList, afterNextToken)];

      expect(result).toHaveLength(2);
      expect(result[0]).toStrictEqual(empty);
      expect(result[1]).toStrictEqual(word("dot"));
    }

    {
      const item = new LR0Item(rule2, 0, [eof]);
      const afterNextToken = item.rule.symbols.slice(item.position + 1);

      const result = [...getFirstSet(grammar, firstSetList, afterNextToken)];

      expect(result).toHaveLength(1);
      expect(result[0]).toStrictEqual(empty);
    }
  });

  test("最初のアイテムをクロージャ展開する", () => {
    const firstItem = new LR0Item(rule0, 0, [eof]);

    const result = closure(grammar, firstItem).map((value) => value.toKeyString());

    expect(result).toHaveLength(2);
    expect(result).toContain(new LR0Item(rule("num", [reference("int"), reference("frac")]), 0, [eof]).toKeyString());
    expect(result).toContain(new LR0Item(rule<number>("int", [word("dig")]), 0, [word("dot"), eof]).toKeyString());
  });

  test("最初のアイテムから最初の行を作成する", () => {
    const firstItem = new LR0Item(rule0, 0, [eof]);

    const result = new ParseTableRow(grammar, [firstItem]);

    const kernels = [...result.kernels].map((value) => value.toKeyString());
    expect(kernels).toHaveLength(1);
    expect(kernels).toContain(new LR0Item(rule<number>("start", [reference("num")]), 0, [eof]).toKeyString());

    const additions = [...result.additions].map((value) => value.toKeyString());

    expect(additions).toHaveLength(2);
    expect(additions).toContain(
      new LR0Item(rule<number>("num", [reference("int"), reference("frac")]), 0, [eof]).toKeyString(),
    );
    expect(additions).toContain(new LR0Item(rule<number>("int", [word("dig")]), 0, [word("dot"), eof]).toKeyString());
  });

  test("最初の行のアイテムをグループ分けする", () => {
    const result = groupByNextToken(
      new ObjectSet([
        new LR0Item(rule<number>("start", [reference("num")]), 0, [eof]),
        new LR0Item(rule<number>("num", [reference("int"), reference("frac")]), 0, [eof]),
        new LR0Item(rule<number>("int", [word("dig")]), 0, [word("dot"), eof]),
      ]),
    );

    expect(result).toHaveLength(3);

    expect(result[0]).toStrictEqual([
      reference("num"),
      new ObjectSet([new LR0Item(rule<number>("start", [reference("num")]), 0, [eof])]),
    ]);

    expect(result[1]).toStrictEqual([
      reference("int"),
      new ObjectSet([new LR0Item(rule<number>("num", [reference("int"), reference("frac")]), 0, [eof])]),
    ]);

    expect(result[2]).toStrictEqual([
      word("dig"),
      new ObjectSet([new LR0Item(rule<number>("int", [word("dig")]), 0, [word("dot"), eof])]),
    ]);
  });
});
