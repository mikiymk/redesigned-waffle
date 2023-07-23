import { expect, test } from "vitest";

import { char, empty, reference, rule, word } from "@/lib/rules/define-rules";

import { getFirstSetList } from "../first-set-list";
import { TokenSet } from "../token-set";

test("終端記号", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // terminal
    rule("E", word("word")),
    rule("E", char("a", "z")),
    rule("E", empty),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(4);

  expect(result[0]).toStrictEqual(new TokenSet([word("word"), char("a", "z"), empty]));
  expect(result[1]).toStrictEqual(new TokenSet([word("word")]));
  expect(result[2]).toStrictEqual(new TokenSet([char("a", "z")]));
  expect(result[3]).toStrictEqual(new TokenSet([empty]));
});

test("非終端記号", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // reference
    rule("E", reference("B")),

    // terminal
    rule("B", word("word")),
    rule("B", char("a", "z")),
    rule("B", empty),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(5);
  expect(result[0]).toStrictEqual(new TokenSet([word("word"), char("a", "z"), empty]));
  expect(result[1]).toStrictEqual(new TokenSet([word("word"), char("a", "z"), empty]));
  expect(result[2]).toStrictEqual(new TokenSet([word("word")]));
  expect(result[3]).toStrictEqual(new TokenSet([char("a", "z")]));
  expect(result[4]).toStrictEqual(new TokenSet([empty]));
});

test("空文字になる可能性がある非終端記号", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // reference
    rule("E", reference("B"), word("after defined")),

    // terminal
    rule("B", word("word")),
    rule("B", char("a", "z")),
    rule("B", empty),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(5);
  expect(result[0]).toStrictEqual(new TokenSet([word("word"), char("a", "z"), word("after defined")]));
  expect(result[1]).toStrictEqual(new TokenSet([word("word"), char("a", "z"), word("after defined")]));
  expect(result[2]).toStrictEqual(new TokenSet([word("word")]));
  expect(result[3]).toStrictEqual(new TokenSet([char("a", "z")]));
  expect(result[4]).toStrictEqual(new TokenSet([empty]));
});

test("左再帰", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // recursion
    rule("E", reference("E"), word("follow lr")),
    rule("E", word("word lr")),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(3);
  expect(result[0]).toStrictEqual(new TokenSet([word("word lr")]));
  expect(result[1]).toStrictEqual(new TokenSet([word("word lr")]));
  expect(result[2]).toStrictEqual(new TokenSet([word("word lr")]));
});

test("右再帰", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // recursion
    rule("E", word("lead rr"), reference("E")),
    rule("E", word("word rr")),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(3);
  expect(result[0]).toStrictEqual(new TokenSet([word("lead rr"), word("word rr")]));
  expect(result[1]).toStrictEqual(new TokenSet([word("lead rr")]));
  expect(result[2]).toStrictEqual(new TokenSet([word("word rr")]));
});

test("間接の左再帰", () => {
  const syntax = [
    // start
    rule("S", reference("A")),

    // recursion 1
    rule("A", reference("B"), word("follow in-lr 1")),

    // recursion 2
    rule("B", reference("A"), word("follow in-lr 2")),
    rule("B", word("word in-lr")),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new TokenSet([word("word in-lr")]));
  expect(result[1]).toStrictEqual(new TokenSet([word("word in-lr")]));
  expect(result[2]).toStrictEqual(new TokenSet([word("word in-lr")]));
  expect(result[3]).toStrictEqual(new TokenSet([word("word in-lr")]));
});

test("間接の右再帰", () => {
  const syntax = [
    // start
    rule("S", reference("A")),

    // recursion 1
    rule("A", word("lead in-rr 1"), reference("B")),

    // recursion 2
    rule("B", word("lead in-rr 2"), reference("A")),
    rule("B", word("word in-rr")),
  ];

  const result = getFirstSetList(syntax);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new TokenSet([word("lead in-rr 1")]));
  expect(result[1]).toStrictEqual(new TokenSet([word("lead in-rr 1")]));
  expect(result[2]).toStrictEqual(new TokenSet([word("lead in-rr 2")]));
  expect(result[3]).toStrictEqual(new TokenSet([word("word in-rr")]));
});
