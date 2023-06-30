import { ParseReader, EOF } from "./reader";
import {  } from "./utils";

type JsonNull = { lang: "json", type: "null", value: null };
type JsonBoolean = { lang: "json", type: "boolean", value: boolean };
type JsonNumber = { lang: "json", type: "number", value: number };
type JsonString = { lang: "json", type: "string", value: string };
type JsonArray = { lang: "json", type: "array", value: JsonValue[] };
type JsonObjectEntry = { lang: "json", type: "object entry", value: [JsonString, JsonValue] };
type JsonObject = { lang: "json", type: "object", value: JsonObjectEntry[] };
type JsonValue =
  | JsonNull
  | JsonBoolean
  | JsonNumber
  | JsonString
  | JsonArray
  | JsonObject;

const ws = = (pr: ParseReader): Result<void> => {
  return $0orMore($switch(
    $word("\u0009"),
    $word("\u000A"),
    $word("\u000D"),
    $word("\u0020"),
  ));
};

const jsonNull = (pr: ParseReader): Result<JsonNull> => {
  return $proc(
    $word("null"),
    () => ({ lang: "json", type: "null", value: null }),
  )(pr);
};

const jsonBoolean = (pr: ParseReader): Result<JsonBoolean> => {
  return $switch(
    $proc(
      $word("true"),
      () => ({ lang: "json", type: "boolean", value: true }),
    ),
    $proc(
      $word("false"),
      () => ({ lang: "json", type: "boolean", value: false }),
    ),
  )(pr);
};

const digits = (pr: ParseReader): Result<number> => {
  return $proc(
    $1orMore($switch(
      $proc($expect("0"), () => 0),
      $proc($expect("1"), () => 1),
      $proc($expect("2"), () => 2),
      $proc($expect("3"), () => 3),
      $proc($expect("4"), () => 4),
      $proc($expect("5"), () => 5),
      $proc($expect("6"), () => 6),
      $proc($expect("7"), () => 7),
      $proc($expect("8"), () => 8),
      $proc($expect("9"), () => 9),
    )),
    (ds) => {
      let value = 0;

      for (const d of ds) {
        value = value * 10 + d;
      }

      return value
    },
  )(pr);
};

const sign = (pr: ParseReader): Result<number> => {
  return $proc(
    $0or1($word("-")),
    (s) => s === "-" ? -1 : 1,
  )(pr);
};

const integer = (pr: ParseReader): Result<number> => {
  return $switch(
    $word("0"),
    digits,
  )(pr);
};

const fractional = (pr: ParseReader): Result<number> => {
  return $proc(
    $seq(
      $word("."),
      digits,
    ),
    ([p, f]) => f === 0 ? 0 : f / 10 ** (Math.floor(Math.log10(f)) + 1),
  )(pr);
};

const exponent = (pr: ParseReader): Result<number> => {
  return $proc(
    $seq(
      $switch($word("e"), $word("E")),
      $0or1($switch($word("+"), $word("-"))),
      digits,
    ),
    ([e, s, d]) => (s === "-" ? -1 : 1) * d,
  )(pr);
};

const jsonNumber = (pr: ParseReader): Result<JsonNumber> => {
  return $proc(
    $seq(
      sign,
      integer,
      $0or1(fractional),
      $0or1(exponent),
    ),
    ([s, i, f, e]) => {
      let value = s * (i + f ?? 0) * 10 ** e ?? 0;
      return { lang: "json", type: "nunber", value };
    },
  )(pr);
};

const character = (pr: ParseReader): Result<JsonString> => {
  return $switch(
    $word("\\\""),
    $word("\\\\"),
    $word("\\\/"),
    $word("\\\b"),
    $word("\\\f"),
    $word("\\\n"),
    $word("\\\r"),
    $word("\\\t"),
    $seq(
      $word("\\\u"),
      hex,
      hex,
      hex,
      hex,
    ),
    // ignore U+0000 to U+001F control characters
    $charRange(0x0020, 0x0021),
    // ignore U+0022 " double quote
    $charRange(0x0023, 0x005B),
    // ignore U+005C \ reverse solidus
    $charRange(0x005D, 0xFFFF),
  )(pr);
};

const jsonString = (pr: ParseReader): Result<JsonString> => {
  return $proc(
    $seq(
      $word('"'),
      $0orMore(character),
      $word('"'),
    ),
    ([sq, cs, eq]) => {
      const value = cs.join("");
      return { lang: "json", type: "string", value };
    },
  )(pr);
};

const jsonArray = (pr: ParseReader): Result<JsonArray> => {
  return $proc(
    $seq(
      $word("["),
      ws,
      $0or1($seq(
        element,
        $0orMore($seq(
          $word(","),
          element,
        )),
      )),
      $word("]"),
    ),
    ([sb, ws, el, eb]) => {
      const value = [];

      if (el) {
        const [first, rest] = el;
        value.push(first);

        for (const [c, item] of rest) {
          value.push(item);
        }
      }
      
      return { lang: "json", type: "array", value };
    },
  )(pr);
};

const jsonObject = (pr: ParseReader): Result<JsonObject> => {
  return $proc(
    $seq(
      $word("{"),
      ws,
      $0or1($seq(
        member,
        $0orMore($seq(
          $word(","),
          member,
        )),
      )),
      $word("}"),
    ),
    ([sq, ws, cs, eq]) => {
      const value = [];

      if (el) {
        const [first, rest] = el;
        value.push(first);

        for (const [c, item] of rest) {
          value.push(item);
        }
      }
      
      return { lang: "json", type: "object", value };
    },
  )(pr);
};

const jsonElement =
  $seq(
    ws,
    $switch(
      jsonObject,
      jsonArray,
      jsonString,
      jsonNumber,
      jsonBoolean,
      jsonNull,
    ),
    ws,
  );

export const json = jsonElement;
