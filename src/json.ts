import { ParseReader, EOF } from "./reader";
import {  } from "./utils";

const ws =
  $while($switch(
    $expect("\u0009"),
    $expect("\u000A"),
    $expect("\u000D"),
    $expect("\u0020"),
  ));

const jsonNull = $expect("null");

const jsonBoolean =
  $switch(
    $expect("true"),
    $expect("false"),
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
