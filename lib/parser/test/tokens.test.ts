import { expect, test } from "vitest";

import { reference, rule, word } from "@/lib/rules/define-rules";

import { ParseBuilder } from "../parse-builder";
import { Tokens } from "../tokens";

const grammar = [rule("S", reference("E")), rule("E", word("1"))];
const builder = new ParseBuilder(grammar);

test("generate tokens", () => {
  expect(() => new Tokens(builder)).not.toThrow();
});

test("get tokenNumber from token", () => {
  const tokens = new Tokens(builder);
  const result = tokens.indexOf(reference("E"));

  expect(result).toBeTypeOf("number");
});

test("get token from number", () => {
  const tokens = new Tokens(builder);
  const tokenNumber = tokens.indexOf(reference("E"));
  const result = tokens.get(tokenNumber);

  expect(result).toEqual(reference("E"));
});
