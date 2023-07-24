import { expect, test } from "vitest";

import { empty, reference, rule, word } from "@/lib/rules/define-rules";
import { ObjectSet } from "@/lib/util/object-set";

import { getFirstSetList } from "../first-set-list";

test("終端記号", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // terminal
    rule("E", word("word", "word")),
    rule("E", empty),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(3);

  expect(result[0]).toStrictEqual(new ObjectSet([word("word", "word"), empty]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("word", "word")]));
  expect(result[2]).toStrictEqual(new ObjectSet([empty]));
});

test("非終端記号", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // reference
    rule("E", reference("B")),

    // terminal
    rule("B", word("word", "word")),
    rule("B", empty),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new ObjectSet([word("word", "word"), empty]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("word", "word"), empty]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word", "word")]));
  expect(result[3]).toStrictEqual(new ObjectSet([empty]));
});

test("空文字になる可能性がある非終端記号", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // reference
    rule("E", reference("B"), word("word", "after defined")),

    // terminal
    rule("B", word("word", "word")),
    rule("B", empty),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new ObjectSet([word("word", "word"), word("word", "after defined")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("word", "word"), word("word", "after defined")]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word", "word")]));
  expect(result[3]).toStrictEqual(new ObjectSet([empty]));
});

test("左再帰", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // recursion
    rule("E", reference("E"), word("word", "follow lr")),
    rule("E", word("word", "word lr")),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(3);
  expect(result[0]).toStrictEqual(new ObjectSet([word("word", "word lr")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("word", "word lr")]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word", "word lr")]));
});

test("右再帰", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // recursion
    rule("E", word("word", "lead rr"), reference("E")),
    rule("E", word("word", "word rr")),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(3);
  expect(result[0]).toStrictEqual(new ObjectSet([word("word", "lead rr"), word("word", "word rr")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("word", "lead rr")]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word", "word rr")]));
});

test("間接の左再帰", () => {
  const syntax = [
    // start
    rule("S", reference("A")),

    // recursion 1
    rule("A", reference("B"), word("word", "follow in-lr 1")),

    // recursion 2
    rule("B", reference("A"), word("word", "follow in-lr 2")),
    rule("B", word("word", "word in-lr")),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new ObjectSet([word("word", "word in-lr")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("word", "word in-lr")]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word", "word in-lr")]));
  expect(result[3]).toStrictEqual(new ObjectSet([word("word", "word in-lr")]));
});

test("間接の右再帰", () => {
  const syntax = [
    // start
    rule("S", reference("A")),

    // recursion 1
    rule("A", word("word", "lead in-rr 1"), reference("B")),

    // recursion 2
    rule("B", word("word", "lead in-rr 2"), reference("A")),
    rule("B", word("word", "word in-rr")),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new ObjectSet([word("word", "lead in-rr 1")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("word", "lead in-rr 1")]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word", "lead in-rr 2")]));
  expect(result[3]).toStrictEqual(new ObjectSet([word("word", "word in-rr")]));
});
