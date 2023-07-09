import { describe, expect, test } from "vitest";

import { fromString } from "../core/reader";

import { json } from "./json";
import { generateParser } from "./object-bnf";

import type { JsonValue } from "./json";
import type { Result } from "../util/parser";

test("parse parser", () => {
  const parser = generateParser({
    start: ["symbol", "s"],

    // (1) S → F
    // (2) S → ( S + F )
    s: ["or", ["symbol", "f"], ["and", "(", ["symbol", "s"], "+", ["symbol", "f"], ")"]],

    // (3) F → 1
    f: "1",
  });

  const pr = fromString("(1+1)");
  const result = parser(pr);

  expect(result).toStrictEqual([true, ["(", "1", "+", "1", ")"]]);
});
