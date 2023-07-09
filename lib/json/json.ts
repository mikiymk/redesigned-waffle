import { char } from "../util/char";
import { either } from "../util/either";
import { map } from "../util/map";
import { zeroOrMore, oneOrMore } from "../util/multiple";
import { opt } from "../util/opt";
import { seq } from "../util/seq";
import { word } from "../util/word";

import type { Parser } from "../util/parser";

type JsonNull = { lang: "json"; type: "null"; value: null };
type JsonBoolean = { lang: "json"; type: "boolean"; value: boolean };
type JsonNumber = { lang: "json"; type: "number"; value: number };
type JsonString = { lang: "json"; type: "string"; value: string };
type JsonArray = { lang: "json"; type: "array"; value: JsonValue[] };
type JsonObjectMember = {
  lang: "json";
  type: "object member";
  value: [JsonString, JsonValue];
};
type JsonObject = { lang: "json"; type: "object"; value: JsonObjectMember[] };
export type JsonValue = JsonNull | JsonBoolean | JsonNumber | JsonString | JsonArray | JsonObject;

/**
 *
 * @param pr
 */
const ws: Parser<void> = (pr) => {
  const [ok, value] = zeroOrMore(either(word("\u0009"), word("\u000A"), word("\u000D"), word("\u0020")))(pr);

  return ok ? [true, undefined] : [false, value];
};

/**
 *
 * @param pr
 */
const jsonNull: Parser<JsonNull> = (pr) => {
  const [ok, value] = word("null")(pr);

  return ok
    ? // eslint-disable-next-line unicorn/no-null
      [true, { lang: "json", type: "null", value: null }]
    : [false, value];
};

/**
 *
 * @param pr
 */
const jsonBoolean: Parser<JsonBoolean> = (pr) => {
  const [ok, value] = either(word("true"), word("false"))(pr);

  return ok
    ? value === "true"
      ? [true, { lang: "json", type: "boolean", value: true }]
      : [true, { lang: "json", type: "boolean", value: false }]
    : [false, value];
};

/**
 *
 * @param pr
 */
const digits: Parser<number> = (pr) => {
  return map(
    oneOrMore(
      either(
        map(word("0"), () => 0),
        map(word("1"), () => 1),
        map(word("2"), () => 2),
        map(word("3"), () => 3),
        map(word("4"), () => 4),
        map(word("5"), () => 5),
        map(word("6"), () => 6),
        map(word("7"), () => 7),
        map(word("8"), () => 8),
        map(word("9"), () => 9),
      ),
    ),
    (ds) => {
      let value = 0;

      for (const d of ds) {
        value = value * 10 + d;
      }

      return value;
    },
  )(pr);
};

/**
 *
 * @param pr
 */
const sign: Parser<number> = (pr) => {
  return map(opt(word("-")), (s) => (s === "-" ? -1 : 1))(pr);
};

/**
 *
 * @param pr
 */
const integer: Parser<number> = (pr) => {
  return either(
    map(word("0"), () => 0),
    digits,
  )(pr);
};

/**
 *
 * @param pr
 */
const fractional: Parser<number> = (pr) => {
  return map(seq(word("."), digits), ([_point, fractional]) =>
    fractional === 0 ? 0 : fractional / 10 ** (Math.floor(Math.log10(fractional)) + 1),
  )(pr);
};

/**
 *
 * @param pr
 */
const exponent: Parser<number> = (pr) => {
  return map(
    seq(either(word("e"), word("E")), opt(either(word("+"), word("-"))), digits),
    ([_exponentDelimiter, s, d]) => (s === "-" ? -1 : 1) * d,
  )(pr);
};

/**
 *
 * @param pr
 */
const jsonNumber: Parser<JsonNumber> = (pr) => {
  return map(
    seq(sign, integer, opt(fractional), opt(exponent)),
    ([sign, integer, fractional, exponent]): JsonNumber => {
      const value = sign * (integer + (fractional ?? 0)) * 10 ** (exponent ?? 0);
      return { lang: "json", type: "number", value };
    },
  )(pr);
};

/**
 *
 * @param pr
 */
const hex: Parser<number> = (pr) => {
  return either(
    map(word("0"), () => 0),
    map(word("1"), () => 1),
    map(word("2"), () => 2),
    map(word("3"), () => 3),
    map(word("4"), () => 4),
    map(word("5"), () => 5),
    map(word("6"), () => 6),
    map(word("7"), () => 7),
    map(word("8"), () => 8),
    map(word("9"), () => 9),
    map(either(word("a"), word("A")), () => 10),
    map(either(word("b"), word("B")), () => 11),
    map(either(word("c"), word("C")), () => 12),
    map(either(word("d"), word("D")), () => 13),
    map(either(word("e"), word("E")), () => 14),
    map(either(word("f"), word("F")), () => 15),
  )(pr);
};

/**
 *
 * @param pr
 */
const character: Parser<string> = (pr) => {
  return either(
    map(word('\\"'), () => '"'),
    map(word("\\\\"), () => "\\"),
    map(word("\\/"), () => "/"),
    map(word("\\b"), () => "\b"),
    map(word("\\f"), () => "\f"),
    map(word("\\n"), () => "\n"),
    map(word("\\r"), () => "\r"),
    map(word("\\t"), () => "\t"),
    map(seq(word("\\u"), hex, hex, hex, hex), ([_u, h1, h2, h3, h4]) => {
      return String.fromCodePoint((h1 << 12) | (h2 << 8) | (h3 << 4) | h4);
    }),

    // ignore U+0000 to U+001F control characters
    char(0x00_20, 0x00_21),
    // ignore U+0022 " double quote
    char(0x00_23, 0x00_5b),
    // ignore U+005C \ reverse solidus
    char(0x00_5d, 0xff_ff),
  )(pr);
};

/**
 *
 * @param pr
 */
const jsonString: Parser<JsonString> = (pr) => {
  return map(seq(word('"'), zeroOrMore(character), word('"')), ([_sq, cs, _eq]): JsonString => {
    const value = cs.join("");
    return { lang: "json", type: "string", value };
  })(pr);
};

/**
 *
 * @param pr
 */
const jsonArray: Parser<JsonArray> = (pr) => {
  return map(
    seq(word("["), ws, opt(seq(jsonElement, zeroOrMore(seq(word(","), jsonElement)))), word("]")),
    ([_startBrace, _ws, element, _endBrace]): JsonArray => {
      const value = [];

      if (element) {
        const [first, rest] = element;
        value.push(first);

        for (const [_c, item] of rest) {
          value.push(item);
        }
      }

      return { lang: "json", type: "array", value };
    },
  )(pr);
};

/**
 *
 * @param pr
 */
const jsonObjectMember: Parser<JsonObjectMember> = (pr) => {
  return map(seq(ws, jsonString, ws, word(":"), jsonElement), ([_s1, key, _s2, _c, value]): JsonObjectMember => {
    return { lang: "json", type: "object member", value: [key, value] };
  })(pr);
};

/**
 *
 * @param pr
 */
const jsonObject: Parser<JsonObject> = (pr) => {
  return map(
    seq(word("{"), ws, opt(seq(jsonObjectMember, zeroOrMore(seq(word(","), jsonObjectMember)))), word("}")),
    ([_sq, _ws, cs, _eq]): JsonObject => {
      const value = [];

      if (cs) {
        const [first, rest] = cs;
        value.push(first);

        for (const [_c, item] of rest) {
          value.push(item);
        }
      }

      return { lang: "json", type: "object", value };
    },
  )(pr);
};

const jsonElement: Parser<JsonValue> = map(
  seq(ws, either(jsonObject, jsonArray, jsonString, jsonNumber, jsonBoolean, jsonNull), ws),
  ([_s1, value, _s2]): JsonValue => {
    return value;
  },
);

export const json = jsonElement;
