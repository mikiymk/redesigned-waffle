import { expect, test } from "vitest";

import { EOF } from "../parse-reader";
import { WordReader } from "../word-reader";

test("スペース区切りの文字列を読み込む", () => {
  const source = "abc efg";
  const reader = new WordReader(source);

  expect(reader.read()).toStrictEqual({ type: "word", value: "abc" });
  expect(reader.read()).toStrictEqual({ type: "word", value: "efg" });
  expect(reader.read()).toStrictEqual(EOF);
});

test("複数スペースを飛ばす", () => {
  const source = "abc    efg";
  const reader = new WordReader(source);

  expect(reader.read()).toStrictEqual({ type: "word", value: "abc" });
  expect(reader.read()).toStrictEqual({ type: "word", value: "efg" });
  expect(reader.read()).toStrictEqual(EOF);
});

test("最初のスペースを飛ばす", () => {
  const source = " abc efg";
  const reader = new WordReader(source);

  expect(reader.read()).toStrictEqual({ type: "word", value: "abc" });
  expect(reader.read()).toStrictEqual({ type: "word", value: "efg" });
  expect(reader.read()).toStrictEqual(EOF);
});

test("最後のスペースを飛ばす", () => {
  const source = "abc efg ";
  const reader = new WordReader(source);

  expect(reader.read()).toStrictEqual({ type: "word", value: "abc" });
  expect(reader.read()).toStrictEqual({ type: "word", value: "efg" });
  expect(reader.read()).toStrictEqual(EOF);
});
