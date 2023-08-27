import { expect, test } from "vitest";

import { empty, reference, rule, word } from "@/lib/rules/define-rules";

import { RuleSet } from "../rule-set";
import { SymbolSet } from "../symbol-set";

test("文法規則セット", () => {
  const grammar = [
    // start
    rule("S", [reference("E")]),

    // reference
    rule("E", [reference("B")]),

    // terminal
    rule("B", [word("word", "word")]),
    rule("B", [empty]),
  ];

  const symbolSet = new SymbolSet(grammar);
  const result = new RuleSet(grammar, symbolSet);

  expect(result.rules).toHaveLength(4);
  expect(() => result.getIndex(rule("S", [reference("E")]))).not.toThrow();
  expect(() => result.getIndex(rule("E", [reference("B")]))).not.toThrow();
  expect(() => result.getIndex(rule("B", [word("word", "word")]))).not.toThrow();
  expect(() => result.getIndex(rule("B", [empty]))).not.toThrow();
});

test("ルールからインデックスを取得する", () => {
  const grammar = [
    // start
    rule("S", [reference("E")]),

    // reference
    rule("E", [reference("B")]),

    // terminal
    rule("B", [word("word", "word")]),
    rule("B", [empty]),
  ];

  const symbolSet = new SymbolSet(grammar);
  const result = new RuleSet(grammar, symbolSet);

  expect(result.rules).toHaveLength(4);
  expect(result.getIndex(rule("S", [reference("E")]))).toBe(0);
  expect(result.getIndex(rule("E", [reference("B")]))).toBe(1);
  expect(result.getIndex(rule("B", [word("word", "word")]))).toBe(2);
  expect(result.getIndex(rule("B", [empty]))).toBe(3);
});

test("インデックスからルールを取得する", () => {
  const grammar = [
    // start
    rule("S", [reference("E")]),

    // reference
    rule("E", [reference("B")]),

    // terminal
    rule("B", [word("word", "word")]),
    rule("B", [empty]),
  ];

  const symbolSet = new SymbolSet(grammar);
  const result = new RuleSet(grammar, symbolSet);

  expect(result.rules).toHaveLength(4);
  expect(result.getRule(0)).toEqual(rule("S", [reference("E")]));
  expect(result.getRule(1)).toEqual(rule("E", [reference("B")]));
  expect(result.getRule(2)).toEqual(rule("B", [word("word", "word")]));
  expect(result.getRule(3)).toEqual(rule("B", [empty]));
});
