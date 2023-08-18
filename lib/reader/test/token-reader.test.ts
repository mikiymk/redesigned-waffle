import { expect, test } from "vitest";

import { EOF } from "../parse-reader";
import { TokenReaderGen } from "../token-reader";

const TokenReader = new TokenReaderGen([
  ["word", "[a-z]+"],
  ["blank", " +"],
  ["op", "[!-/:-@[-`{-~}]+"],
]);

test("スペース区切りの文字列を読み込む", () => {
  const source = "abc efg";
  const reader = TokenReader.reader(source);

  expect(reader.read()).toStrictEqual({ type: "word", value: "abc" });
  expect(reader.read()).toStrictEqual({ type: "blank", value: " " });
  expect(reader.read()).toStrictEqual({ type: "word", value: "efg" });
  expect(reader.read()).toStrictEqual(EOF);
});

test("記号と文字を分けて読み込む", () => {
  const source = "abc+efg";
  const reader = TokenReader.reader(source);

  expect(reader.read()).toStrictEqual({ type: "word", value: "abc" });
  expect(reader.read()).toStrictEqual({ type: "op", value: "+" });
  expect(reader.read()).toStrictEqual({ type: "word", value: "efg" });
  expect(reader.read()).toStrictEqual(EOF);
});

test("空のパターン", () => {
  expect(() => new TokenReaderGen([["word", "[a-z]*"]])).toThrow();
});
