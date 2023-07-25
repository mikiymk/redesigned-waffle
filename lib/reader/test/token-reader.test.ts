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

  expect(reader.next("word")).toStrictEqual({ done: false, value: { type: "word", value: "abc" } });
  expect(reader.next("blank")).toStrictEqual({ done: false, value: { type: "blank", value: " " } });
  expect(reader.next("word")).toStrictEqual({ done: false, value: { type: "word", value: "efg" } });
  expect(reader.next("eof")).toStrictEqual({ done: true, value: EOF });
});

test("記号と文字を分けて読み込む", () => {
  const source = "abc+efg";
  const reader = TokenReader.reader(source);

  expect(reader.next("word")).toStrictEqual({ done: false, value: { type: "word", value: "abc" } });
  expect(reader.next("op")).toStrictEqual({ done: false, value: { type: "op", value: "+" } });
  expect(reader.next("word")).toStrictEqual({ done: false, value: { type: "word", value: "efg" } });
  expect(reader.next("word")).toStrictEqual({ done: true, value: EOF });
});
