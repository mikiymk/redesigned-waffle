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

const ws =
  $while($switch(
    $expect("\u0009"),
    $expect("\u000A"),
    $expect("\u000D"),
    $expect("\u0020"),
  ));

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
  return $while($switch(
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
  ));
};

const sign = (pr: ParseReader): Result<number> => {
  return $proc(
    $0or1($expect("-")),
    (s) => s === "-" ? -1 : 1,
  );
};

const integer = (pr: ParseReader): Result<number> => {
  return $switch(
    $expect("0"),
    digits,
  );
};

const fractional = (pr: ParseReader): Result<number> => {
  return $seq(
    $expect("."),
    digits,
  );
};

const exponent = (pr: ParseReader): Result<number> => {
  return $seq(
    $switch($expect("e"), $expect("E")),
    $0or1($switch($expect("+"), $expect("-"))),
    digits,
  );
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
      let value = s * (i + f) * 10 ** e;
      return { lang: "json", type: "nunber", value };
    },
  );
};

const jsonString = (pr: ParseReader): Result<JsonString> => {};
const jsonArray = (pr: ParseReader): Result<JsonArray> => {};
const jsonObject = (pr: ParseReader): Result<JsonObject> => {};

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
