import { expect, test } from "vitest";

import { char, empty, eof, reference, rule, word } from "@/lib/rules/define-rules";
import { ObjectSet } from "@/lib/util/object-set";

import { FirstSets } from "../first-set";
import { FollowSets } from "../follow-set";
import { GrammarRules } from "../grammar-rules";
import { Tokens } from "../tokens";

test("basic", () => {
  const grammar = [
    rule("S", reference("B"), word("end")),

    rule("B", word("word"), word("after word")),
    rule("B", char("A", "Z"), word("after char")),
    rule("B", empty),
  ];

  const tokens = new Tokens(grammar);
  const rules = new GrammarRules(grammar, tokens);
  const firstSets = new FirstSets(tokens, rules);
  const followSets = new FollowSets(tokens, rules, firstSets);

  expect(followSets.followSets[0]).toStrictEqual(new ObjectSet([eof]));
  expect(followSets.followSets[1]).toStrictEqual(new ObjectSet([word("end")]));
  expect(followSets.followSets[2]).toStrictEqual(new ObjectSet([word("end")]));
  expect(followSets.followSets[3]).toStrictEqual(new ObjectSet([word("end")]));
});

test("reference", () => {
  const grammar = [
    rule("S", reference("E"), word("end")),

    rule("E", word("first"), reference("B"), word("dog")),

    rule("B", word("word")),
    rule("B", empty),
  ];

  const tokens = new Tokens(grammar);
  const rules = new GrammarRules(grammar, tokens);
  const firstSets = new FirstSets(tokens, rules);
  const followSets = new FollowSets(tokens, rules, firstSets);

  expect(followSets.followSets[0]).toStrictEqual(new ObjectSet([eof]));
  expect(followSets.followSets[1]).toStrictEqual(new ObjectSet([word("end")]));
  expect(followSets.followSets[2]).toStrictEqual(new ObjectSet([word("dog")]));
  expect(followSets.followSets[3]).toStrictEqual(new ObjectSet([word("dog")]));
});

test("recursion", () => {
  const grammar = [
    rule("S", reference("E"), word("end")),

    rule("E", word("first"), reference("B"), word("dog")),
    rule("E", word("dog"), reference("E"), word("cat")),

    rule("B", word("word")),
    rule("B", empty),
  ];

  const tokens = new Tokens(grammar);
  const rules = new GrammarRules(grammar, tokens);
  const firstSets = new FirstSets(tokens, rules);
  const followSets = new FollowSets(tokens, rules, firstSets);

  expect(followSets.followSets[0]).toStrictEqual(new ObjectSet([eof]));
  expect(followSets.followSets[1]).toStrictEqual(new ObjectSet([word("end"), word("cat")]));
  expect(followSets.followSets[2]).toStrictEqual(new ObjectSet([word("end"), word("cat")]));
  expect(followSets.followSets[3]).toStrictEqual(new ObjectSet([word("dog")]));
  expect(followSets.followSets[4]).toStrictEqual(new ObjectSet([word("dog")]));
});

test("reference after reference", () => {
  const grammar = [
    rule("S", reference("E"), word("end")),

    rule("E", reference("B"), word("last")),
    rule("E", reference("E"), reference("B"), word("cat")),

    rule("B", word("word")),
    rule("B", empty),
  ];

  const tokens = new Tokens(grammar);
  const rules = new GrammarRules(grammar, tokens);
  const firstSets = new FirstSets(tokens, rules);
  const followSets = new FollowSets(tokens, rules, firstSets);

  expect(followSets.followSets[0]).toStrictEqual(new ObjectSet([eof]));
  expect(followSets.followSets[1]).toStrictEqual(new ObjectSet([word("end"), word("word"), word("cat")]));
  expect(followSets.followSets[2]).toStrictEqual(new ObjectSet([word("end"), word("word"), word("cat")]));
  expect(followSets.followSets[3]).toStrictEqual(new ObjectSet([word("last"), word("cat")]));
  expect(followSets.followSets[4]).toStrictEqual(new ObjectSet([word("last"), word("cat")]));
});
