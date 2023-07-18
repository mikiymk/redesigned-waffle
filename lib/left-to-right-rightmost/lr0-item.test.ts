import { expect, test } from "vitest";

import { epsilon, reference, rule, word } from "../left-to-right-leftmost/define-rules";

import { getLR0Item } from "./lr0-item";

test("get items from rule", () => {
  const ruleS = rule("S", reference("E"), word("+"), reference("E"));

  const result = getLR0Item(ruleS);

  expect(result).toStrictEqual({
    name: "S",
    tokens: [reference("E"), word("+"), reference("E")],
    position: 0,
  });
});

test("get items from empty rule", () => {
  const ruleS = rule("S", epsilon);

  const result = getLR0Item(ruleS);

  expect(result).toStrictEqual({
    name: "S",
    tokens: [],
    position: 0,
  });
});
