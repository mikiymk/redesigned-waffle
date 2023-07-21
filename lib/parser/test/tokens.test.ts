import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { Tokens } from "../tokens";

test("generate tokens", () => {
  expect(() => new Tokens([rule("S", reference("E")), rule("E", word("1"))])).not.toThrow();
});

test("get tokenNumber from token", () => {
  const tokens = new Tokens([rule("S", reference("E")), rule("E", word("1"))]);
  const result = tokens.indexOf(reference("E"));

  expect(result).toBeTypeOf("number");
});

test("get token from number", () => {
  const tokens = new Tokens([rule("S", reference("E")), rule("E", word("1"))]);
  const tokenNumber = tokens.indexOf(reference("E"));
  const result = tokens.get(tokenNumber);

  expect(result).toEqual(reference("E"));
});
