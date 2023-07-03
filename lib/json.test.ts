import { expect, test } from "vitest";

import { json } from "./json";
import { generatePR } from "./reader";

import type { JsonValue } from "./json";
import type { Result } from "./utils";

const cases: [string, Result<JsonValue>][] = [
  // # json null
  // eslint-disable-next-line unicorn/no-null
  ["null", [true, { lang: "json", type: "null", value: null }]],

  // # json boolean
  ["true", [true, { lang: "json", type: "boolean", value: true }]],
  ["false", [true, { lang: "json", type: "boolean", value: false }]],

  // # json number
  ["0", [true, { lang: "json", type: "number", value: 0 }]],
  ["-0", [true, { lang: "json", type: "number", value: -0 }]],
  ["123", [true, { lang: "json", type: "number", value: 123 }]],
  ["123.45", [true, { lang: "json", type: "number", value: 123.45 }]],
  ["123e45", [true, { lang: "json", type: "number", value: 123e45 }]],
  ["123.45e6", [true, { lang: "json", type: "number", value: 123.45e6 }]],

  // # json string
  ['""', [true, { lang: "json", type: "string", value: "" }]],
  ['"abc"', [true, { lang: "json", type: "string", value: "abc" }]],
  ['"\\""', [true, { lang: "json", type: "string", value: '"' }]],
  ['"\\\\"', [true, { lang: "json", type: "string", value: "\\" }]],
  ['"\\b"', [true, { lang: "json", type: "string", value: "\b" }]],
  ['"\\f"', [true, { lang: "json", type: "string", value: "\f" }]],
  ['"\\n"', [true, { lang: "json", type: "string", value: "\n" }]],
  ['"\\r"', [true, { lang: "json", type: "string", value: "\r" }]],
  ['"\\t"', [true, { lang: "json", type: "string", value: "\t" }]],
  ['"\\u1234"', [true, { lang: "json", type: "string", value: "\u1234" }]],

  // # json array
  ["[]", [true, { lang: "json", type: "array", value: [] }]],
  ["[ ]", [true, { lang: "json", type: "array", value: [] }]],
  [
    '[ true , "2" , 3 ]',
    [
      true,
      {
        lang: "json",
        type: "array",
        value: [
          { lang: "json", type: "boolean", value: true },
          { lang: "json", type: "string", value: "2" },
          { lang: "json", type: "number", value: 3 },
        ],
      },
    ],
  ],
  [
    '[true,"2",3]',
    [
      true,
      {
        lang: "json",
        type: "array",
        value: [
          { lang: "json", type: "boolean", value: true },
          { lang: "json", type: "string", value: "2" },
          { lang: "json", type: "number", value: 3 },
        ],
      },
    ],
  ],

  // # json object
  ["{}", [true, { lang: "json", type: "object", value: [] }]],
  ["{ }", [true, { lang: "json", type: "object", value: [] }]],
  [
    '{"a":true,"b":"2","c":3}',
    [
      true,
      {
        lang: "json",
        type: "object",
        value: [
          {
            lang: "json",
            type: "object member",
            value: [
              { lang: "json", type: "string", value: "a" },
              { lang: "json", type: "boolean", value: true },
            ],
          },
          {
            lang: "json",
            type: "object member",
            value: [
              { lang: "json", type: "string", value: "b" },
              { lang: "json", type: "string", value: "2" },
            ],
          },
          {
            lang: "json",
            type: "object member",
            value: [
              { lang: "json", type: "string", value: "c" },
              { lang: "json", type: "number", value: 3 },
            ],
          },
        ],
      },
    ],
  ],
];

test.each(cases)("parse %j", (source, value) => {
  const pr = generatePR(source);
  expect(json(pr)).toStrictEqual(value);
});
