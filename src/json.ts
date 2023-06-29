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

const jsonNull = 
  $proc($expect("null"), () => ({ lang: "json", type: "null", value: null }));

const jsonBoolean =
  $switch(
    $proc($expect("true"), () => ({ lang: "json", type: "boolean", value: true })),
    $proc($expect("false"), () => ({ lang: "json", type: "boolean", value: false })),
  );

const jsonNumber =

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
