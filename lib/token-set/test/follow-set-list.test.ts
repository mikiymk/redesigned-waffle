import { expect, test } from "vitest";

import { eof, empty, reference, rule, word } from "@/lib/rules/define-rules";
import { ObjectSet } from "@/lib/util/object-set";

import { getFirstSetList } from "../first-set";
import { getFollowSetList } from "../follow-set";

test("１つの記号", () => {
  const syntax = [
    // start
    rule("S", [reference("E")]),

    // reference
    rule("E", [reference("B")]),

    // terminal
    rule("B", [word("word", "word")]),
    rule("B", [empty]),
  ];

  const firstSet = getFirstSetList(syntax);
  const result = getFollowSetList(syntax, firstSet);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new ObjectSet([eof]));
  expect(result[1]).toStrictEqual(new ObjectSet([eof]));
  expect(result[2]).toStrictEqual(new ObjectSet([eof]));
  expect(result[3]).toStrictEqual(new ObjectSet([eof]));
});

test("非終端記号の後に終端記号", () => {
  const syntax = [
    // start
    rule("S", [reference("E")]),

    // reference
    rule("E", [reference("B"), word("word", "after defined")]),

    // terminal
    rule("B", [word("word", "word")]),
  ];

  const firstSet = getFirstSetList(syntax);
  const result = getFollowSetList(syntax, firstSet);

  expect(result).toHaveLength(3);
  expect(result[0]).toStrictEqual(new ObjectSet([eof]));
  expect(result[1]).toStrictEqual(new ObjectSet([eof]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word", "after defined")]));
});

test("空になる可能性がある非終端記号の後に終端記号", () => {
  const syntax = [
    // start
    rule("S", [reference("E")]),

    // reference
    rule("E", [reference("B"), word("word", "after defined")]),

    // terminal
    rule("B", [word("word", "word")]),
    rule("B", [empty]),
  ];

  const firstSet = getFirstSetList(syntax);
  const result = getFollowSetList(syntax, firstSet);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new ObjectSet([eof]));
  expect(result[1]).toStrictEqual(new ObjectSet([eof]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word", "after defined")]));
});

test("左再帰", () => {
  const syntax = [
    // start
    rule("S", [reference("E")]),

    // recursion
    rule("E", [reference("E"), word("word", "follow lr")]),
    rule("E", [word("word", "word lr")]),
  ];

  const firstSet = getFirstSetList(syntax);
  const result = getFollowSetList(syntax, firstSet);

  expect(result).toHaveLength(3);
  expect(result[0]).toStrictEqual(new ObjectSet([eof]));
  expect(result[1]).toStrictEqual(new ObjectSet([eof, word("word", "follow lr")]));
  expect(result[2]).toStrictEqual(new ObjectSet([eof, word("word", "follow lr")]));
});

test("右再帰", () => {
  const syntax = [
    // start
    rule("S", [reference("E")]),

    // recursion
    rule("E", [word("word", "lead rr"), reference("E")]),
    rule("E", [word("word", "word rr")]),
  ];

  const firstSet = getFirstSetList(syntax);
  const result = getFollowSetList(syntax, firstSet);

  expect(result).toHaveLength(3);
  expect(result[0]).toStrictEqual(new ObjectSet([eof]));
  expect(result[1]).toStrictEqual(new ObjectSet([eof]));
  expect(result[2]).toStrictEqual(new ObjectSet([eof]));
});

test("間接の左再帰", () => {
  const syntax = [
    // start
    rule("S", [reference("A")]),

    // recursion 1
    rule("A", [reference("B"), word("word", "follow in-lr 1")]),

    // recursion 2
    rule("B", [reference("A"), word("word", "follow in-lr 2")]),
    rule("B", [word("word", "word in-lr")]),
  ];

  const firstSet = getFirstSetList(syntax);
  const result = getFollowSetList(syntax, firstSet);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new ObjectSet([eof]));
  expect(result[1]).toStrictEqual(new ObjectSet([eof, word("word", "follow in-lr 2")]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word", "follow in-lr 1")]));
  expect(result[3]).toStrictEqual(new ObjectSet([word("word", "follow in-lr 1")]));
});

test("間接の右再帰", () => {
  const syntax = [
    // start
    rule("S", [reference("A")]),

    // recursion 1
    rule("A", [word("word", "lead in-rr 1"), reference("B")]),

    // recursion 2
    rule("B", [word("word", "lead in-rr 2"), reference("A")]),
    rule("B", [word("word", "word in-rr")]),
  ];

  const firstSet = getFirstSetList(syntax);
  const result = getFollowSetList(syntax, firstSet);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new ObjectSet([eof]));
  expect(result[1]).toStrictEqual(new ObjectSet([eof]));
  expect(result[2]).toStrictEqual(new ObjectSet([eof]));
  expect(result[3]).toStrictEqual(new ObjectSet([eof]));
});
