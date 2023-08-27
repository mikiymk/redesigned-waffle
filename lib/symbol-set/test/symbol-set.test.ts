import { expect, test } from "vitest";

import { empty, eof, reference, rule, word } from "@/lib/rules/define-rules";

import { SymbolSet } from "../symbol-set";

test("文法の記号セット", () => {
  const grammar = [
    // start
    rule("S", [reference("E")]),

    // reference
    rule("E", [reference("B")]),

    // terminal
    rule("B", [word("word", "word")]),
    rule("B", [empty]),
  ];

  const result = new SymbolSet(grammar);

  expect(result.symbolList).toHaveLength(3);
  expect(() => result.getIndex(reference("E"))).not.toThrow();
  expect(() => result.getIndex(reference("B"))).not.toThrow();
  expect(() => result.getIndex(word("word", "word"))).not.toThrow();

  expect(() => result.getIndex(empty)).not.toThrow();
  expect(() => result.getIndex(eof)).not.toThrow();

  expect(() => result.getIndex(reference("D"))).toThrow();
  expect(() => result.getIndex(word("word"))).toThrow();
});

test("空トークンと終端トークン", () => {
  const grammar = [
    // start
    rule("S", [reference("E")]),

    // reference
    rule("E", [reference("B")]),

    // terminal
    rule("B", [word("word", "word")]),
  ];

  const result = new SymbolSet(grammar);

  expect(result.symbolList).toHaveLength(3);

  expect(result.getIndex(empty)).toBe(-2);
  expect(result.getIndex(eof)).toBe(-1);
});

test("インデックスから記号を取得する", () => {
  const grammar = [
    // start
    rule("S", [reference("E")]),

    // reference
    rule("E", [reference("B")]),

    // terminal
    rule("B", [word("word", "word")]),
    rule("B", [empty]),
  ];

  const result = new SymbolSet(grammar);

  expect(result.symbolList).toHaveLength(3);

  expect(result.getSymbol(result.getIndex(empty))).toEqual(empty);
  expect(result.getSymbol(result.getIndex(eof))).toEqual(eof);

  expect(result.getSymbol(result.getIndex(reference("E")))).toEqual(reference("E"));
  expect(result.getSymbol(result.getIndex(reference("B")))).toEqual(reference("B"));
  expect(result.getSymbol(result.getIndex(word("word", "word")))).toEqual(word("word", "word"));
});
