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

const jsonNumber = (pr: ParseReader): Result<JsonNumber> => {
  return $proc(
    $seq(
      $0or1($expect("-")),
      $switch(
        $expect("0"),
        $1orN(digit),
      ),
      $0or1($seq(
        $expect("."),
        $1orN(digit),
      )),
      $0or1($seq(
        $switch(
          $expect("e"),
          $expect("E"),
        ),
        $0or1($switch(
          $expect("+"),
          $expect("-"),
        )),
        $1orN(digit),
      )),
    ),
    ([sign, int, frac, exp]) => {
      let value = 1;

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
