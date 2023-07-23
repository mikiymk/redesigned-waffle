import { expect, test } from "vitest";

import { char, eof, empty, reference, rule, word } from "@/lib/rules/define-rules";
import { ObjectSet } from "@/lib/util/object-set";

import { getDirectorSetList } from "../director-set-list";
import { getFirstSetList } from "../first-set-list";
import { getFollowSetList } from "../follow-set-list";

test("１つの記号", () => {
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

  const firstSet = getFirstSetList(syntax);
  const followSet = getFollowSetList(syntax, firstSet);
  const result = getDirectorSetList(firstSet, followSet);

  expect(result).toHaveLength(5);
  expect(result[0]).toStrictEqual(new ObjectSet([word("word"), char("a", "z"), eof]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("word"), char("a", "z"), eof]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word")]));
  expect(result[3]).toStrictEqual(new ObjectSet([char("a", "z")]));
  expect(result[4]).toStrictEqual(new ObjectSet([eof]));
});

test("非終端記号の後に終端記号", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // reference
    rule("E", reference("B"), word("after defined")),

    // terminal
    rule("B", word("word")),
  ];

  const firstSet = getFirstSetList(syntax);
  const followSet = getFollowSetList(syntax, firstSet);
  const result = getDirectorSetList(firstSet, followSet);

  expect(result).toHaveLength(3);
  expect(result[0]).toStrictEqual(new ObjectSet([word("word")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("word")]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word")]));
});

test("空になる可能性がある非終端記号の後に終端記号", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // reference
    rule("E", reference("B"), word("after defined")),

    // terminal
    rule("B", word("word")),
    rule("B", empty),
  ];

  const firstSet = getFirstSetList(syntax);
  const followSet = getFollowSetList(syntax, firstSet);
  const result = getDirectorSetList(firstSet, followSet);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new ObjectSet([word("word"), word("after defined")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("word"), word("after defined")]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word")]));
  expect(result[3]).toStrictEqual(new ObjectSet([word("after defined")]));
});

test("左再帰", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // recursion
    rule("E", reference("E"), word("follow lr")),
    rule("E", word("word lr")),
  ];

  const firstSet = getFirstSetList(syntax);
  const followSet = getFollowSetList(syntax, firstSet);
  const result = getDirectorSetList(firstSet, followSet);

  expect(result).toHaveLength(3);
  expect(result[0]).toStrictEqual(new ObjectSet([word("word lr")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("word lr")]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word lr")]));
});

test("右再帰", () => {
  const syntax = [
    // start
    rule("S", reference("E")),

    // recursion
    rule("E", word("lead rr"), reference("E")),
    rule("E", word("word rr")),
  ];

  const firstSet = getFirstSetList(syntax);
  const followSet = getFollowSetList(syntax, firstSet);
  const result = getDirectorSetList(firstSet, followSet);

  expect(result).toHaveLength(3);
  expect(result[0]).toStrictEqual(new ObjectSet([word("lead rr"), word("word rr")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("lead rr")]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word rr")]));
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

  const firstSet = getFirstSetList(syntax);
  const followSet = getFollowSetList(syntax, firstSet);
  const result = getDirectorSetList(firstSet, followSet);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new ObjectSet([word("word in-lr")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("word in-lr")]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("word in-lr")]));
  expect(result[3]).toStrictEqual(new ObjectSet([word("word in-lr")]));
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

  const firstSet = getFirstSetList(syntax);
  const followSet = getFollowSetList(syntax, firstSet);
  const result = getDirectorSetList(firstSet, followSet);

  expect(result).toHaveLength(4);
  expect(result[0]).toStrictEqual(new ObjectSet([word("lead in-rr 1")]));
  expect(result[1]).toStrictEqual(new ObjectSet([word("lead in-rr 1")]));
  expect(result[2]).toStrictEqual(new ObjectSet([word("lead in-rr 2")]));
  expect(result[3]).toStrictEqual(new ObjectSet([word("word in-rr")]));
});
