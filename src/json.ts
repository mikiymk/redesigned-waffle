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
    $expect("\u0009"),
    $expect("\u000A"),
    $expect("\u000D"),
    $expect("\u0020"),
  ));
};

const jsonNull = (pr: ParseReader): Result<JsonNull> => {
  return $proc(
    $expect("null"),
    () => ({ lang: "json", type: "null", value: null }),
  )(pr);
};

const jsonBoolean = (pr: ParseReader): Result<JsonBoolean> => {
  return $switch(
    $proc(
      $expect("true"),
      () => ({ lang: "json", type: "boolean", value: true }),
    ),
    $proc(
      $expect("false"),
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
    $0or1($expect("-")),
    (s) => s === "-" ? -1 : 1,
  )(pr);
};

const integer = (pr: ParseReader): Result<number> => {
  return $switch(
    $expect("0"),
    digits,
  )(pr);
};

const fractional = (pr: ParseReader): Result<number> => {
  return $proc(
    $seq(
      $expect("."),
      digits,
    ),
    ([p, f]) => f === 0 ? 0 : f / 10 ** (Math.floor(Math.log10(f)) + 1),
  )(pr);
};

const exponent = (pr: ParseReader): Result<number> => {
  return $proc(
    $seq(
      $switch($expect("e"), $expect("E")),
      $0or1($switch($expect("+"), $expect("-"))),
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

const jsonString = (pr: ParseReader): Result<JsonString> => {
  return $proc(
    $seq(
      $except('"'),
      $0orMore(character),
      $except('"'),
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
      $except("["),
      ws,
      $0or1($seq(
        element,
        $0orMore($seq(
          $except(","),
          element,
        )),
      )),
      $except("]"),
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
      $except("{"),
      ws,
      $0or1($seq(
        member,
        $0orMore($seq(
          $except(","),
          member,
        )),
      )),
      $except("}"),
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
