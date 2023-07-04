import { word } from "./util/word";
import { $0or1, $0orMore, $1orMore, $charRange, $proc, $seq, $switch } from "./utils";

import type { Parser } from "./util/parser";

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

const ws: Parser<void> = (pr) => {
  const [ok, value] = $0orMore($switch(word("\u0009"), word("\u000A"), word("\u000D"), word("\u0020")))(pr);

  return ok ? [true, undefined] : [false, value];
};

const jsonNull: Parser<JsonNull> = (pr) => {
  const [ok, value] = word("null")(pr);

  return ok
    ? // eslint-disable-next-line unicorn/no-null
      [true, { lang: "json", type: "null", value: null }]
    : [false, value];
};

const jsonBoolean: Parser<JsonBoolean> = (pr) => {
  const [ok, value] = $switch(word("true"), word("false"))(pr);

  return ok
    ? value === "true"
      ? [true, { lang: "json", type: "boolean", value: true }]
      : [true, { lang: "json", type: "boolean", value: false }]
    : [false, value];
};

const digits: Parser<number> = (pr) => {
  return $proc(
    $1orMore(
      $switch(
        $proc(word("0"), () => 0),
        $proc(word("1"), () => 1),
        $proc(word("2"), () => 2),
        $proc(word("3"), () => 3),
        $proc(word("4"), () => 4),
        $proc(word("5"), () => 5),
        $proc(word("6"), () => 6),
        $proc(word("7"), () => 7),
        $proc(word("8"), () => 8),
        $proc(word("9"), () => 9),
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

const sign: Parser<number> = (pr) => {
  return $proc($0or1(word("-")), (s) => (s === "-" ? -1 : 1))(pr);
};

const integer: Parser<number> = (pr) => {
  return $switch(
    $proc(word("0"), () => 0),
    digits,
  )(pr);
};

const fractional: Parser<number> = (pr) => {
  return $proc($seq(word("."), digits), ([_point, fractional]) =>
    fractional === 0 ? 0 : fractional / 10 ** (Math.floor(Math.log10(fractional)) + 1),
  )(pr);
};

const exponent: Parser<number> = (pr) => {
  return $proc(
    $seq($switch(word("e"), word("E")), $0or1($switch(word("+"), word("-"))), digits),
    ([_exponentDelimiter, s, d]) => (s === "-" ? -1 : 1) * d,
  )(pr);
};

const jsonNumber: Parser<JsonNumber> = (pr) => {
  return $proc(
    $seq(sign, integer, $0or1(fractional), $0or1(exponent)),
    ([sign, integer, fractional, exponent]): JsonNumber => {
      const value = sign * (integer + (fractional ?? 0)) * 10 ** (exponent ?? 0);
      return { lang: "json", type: "number", value };
    },
  )(pr);
};

const hex: Parser<number> = (pr) => {
  return $switch(
    $proc(word("0"), () => 0),
    $proc(word("1"), () => 1),
    $proc(word("2"), () => 2),
    $proc(word("3"), () => 3),
    $proc(word("4"), () => 4),
    $proc(word("5"), () => 5),
    $proc(word("6"), () => 6),
    $proc(word("7"), () => 7),
    $proc(word("8"), () => 8),
    $proc(word("9"), () => 9),
    $proc($switch(word("a"), word("A")), () => 10),
    $proc($switch(word("b"), word("B")), () => 11),
    $proc($switch(word("c"), word("C")), () => 12),
    $proc($switch(word("d"), word("D")), () => 13),
    $proc($switch(word("e"), word("E")), () => 14),
    $proc($switch(word("f"), word("F")), () => 15),
  )(pr);
};

const character: Parser<string> = (pr) => {
  return $switch(
    $proc(word('\\"'), () => '"'),
    $proc(word("\\\\"), () => "\\"),
    $proc(word("\\/"), () => "/"),
    $proc(word("\\b"), () => "\b"),
    $proc(word("\\f"), () => "\f"),
    $proc(word("\\n"), () => "\n"),
    $proc(word("\\r"), () => "\r"),
    $proc(word("\\t"), () => "\t"),
    $proc($seq(word("\\u"), hex, hex, hex, hex), ([_u, h1, h2, h3, h4]) => {
      return String.fromCodePoint((h1 << 12) | (h2 << 8) | (h3 << 4) | h4);
    }),

    // ignore U+0000 to U+001F control characters
    $charRange(0x00_20, 0x00_21),
    // ignore U+0022 " double quote
    $charRange(0x00_23, 0x00_5b),
    // ignore U+005C \ reverse solidus
    $charRange(0x00_5d, 0xff_ff),
  )(pr);
};

const jsonString: Parser<JsonString> = (pr) => {
  return $proc($seq(word('"'), $0orMore(character), word('"')), ([_sq, cs, _eq]): JsonString => {
    const value = cs.join("");
    return { lang: "json", type: "string", value };
  })(pr);
};

const jsonArray: Parser<JsonArray> = (pr) => {
  return $proc(
    $seq(word("["), ws, $0or1($seq(jsonElement, $0orMore($seq(word(","), jsonElement)))), word("]")),
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

const jsonObjectMember: Parser<JsonObjectMember> = (pr) => {
  return $proc($seq(ws, jsonString, ws, word(":"), jsonElement), ([_s1, key, _s2, _c, value]): JsonObjectMember => {
    return { lang: "json", type: "object member", value: [key, value] };
  })(pr);
};

const jsonObject: Parser<JsonObject> = (pr) => {
  return $proc(
    $seq(word("{"), ws, $0or1($seq(jsonObjectMember, $0orMore($seq(word(","), jsonObjectMember)))), word("}")),
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

const jsonElement: Parser<JsonValue> = $proc(
  $seq(ws, $switch(jsonObject, jsonArray, jsonString, jsonNumber, jsonBoolean, jsonNull), ws),
  ([_s1, value, _s2]): JsonValue => {
    return value;
  },
);

export const json = jsonElement;
