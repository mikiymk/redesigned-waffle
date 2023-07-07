import { expect, test } from "vitest";

import { fromString } from "./core/reader";
import { toml } from "./main";

import type { TomlData } from "./toml";
import type { Result } from "./util/parser";

const cases: [string, Result<TomlData>][] = [
  ["", [true, { lang: "toml", type: "data", value: [] }]],
  ["\n", [true, { lang: "toml", type: "data", value: [] }]],
  ["\r\n", [true, { lang: "toml", type: "data", value: [] }]],
  ["\n\n\n", [true, { lang: "toml", type: "data", value: [] }]],
  ["\n # comment", [true, { lang: "toml", type: "data", value: [] }]],
  ["\n # comment\n", [true, { lang: "toml", type: "data", value: [] }]],
];

test.skip("parse %j", () => {
  const pr = fromString("");
  expect(toml(pr)).toStrictEqual({});
});

test.skip.each(cases)("parse %j", (source, value) => {
  const pr = fromString(source);
  expect(toml(pr)).toStrictEqual(value);
});
