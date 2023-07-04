import { expect, test } from "vitest";

import { toml } from "./main";
import { generatePR } from "./reader";

import type { TomlData } from "./toml";
import type { Result } from "./utils";

const cases: [string, Result<TomlData>][] = [
  ["", [true, { lang: "toml", type: "data", value: [] }]],
  ["\n", [true, { lang: "toml", type: "data", value: [] }]],
  ["\r\n", [true, { lang: "toml", type: "data", value: [] }]],
  ["\n\n\n", [true, { lang: "toml", type: "data", value: [] }]],
  ["\n # comment", [true, { lang: "toml", type: "data", value: [] }]],
  ["\n # comment\n", [true, { lang: "toml", type: "data", value: [] }]],
];

test.skip("parse %j", () => {
    const pr = generatePR("");
    expect(toml(pr)).toStrictEqual({});
  });

test.skip.each(cases)("parse %j", (source, value) => {
  const pr = generatePR(source);
  expect(toml(pr)).toStrictEqual(value);
});
