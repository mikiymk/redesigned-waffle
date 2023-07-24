import { expect, test } from "vitest";

import { empty, reference, rule, word } from "@/lib/rules/define-rules";

import { LR0Item } from "../lr0-item";

test("get items from rule", () => {
  const ruleS = rule("S", reference("E"), word("word", "+"), reference("E"));

  const result = new LR0Item(ruleS);

  expect(result.rule).toStrictEqual(rule("S", reference("E"), word("word", "+"), reference("E")));

  expect(result.position).toBe(0);
});

test("get items from empty rule", () => {
  const ruleS = rule("S", empty);

  const result = new LR0Item(ruleS);

  expect(result.rule).toStrictEqual(rule("S", empty));

  expect(result.position).toBe(0);
});
