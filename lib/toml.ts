import { $1orMore, $charRange, $seq, $switch, $while, $word } from "./utils";

import type { Parser } from "./utils";

type TomlComment = { lang: "toml"; type: "comment"; value: string };
type TomlKeyValue = { lang: "toml"; type: "key value"; value: [TomlKey, TomlValue] };
type TomlKey = TomlBareKey | TomlQuotedKey | TomlDottedKey;
type TomlBareKey = { lang: "toml"; type: "bare key"; value: string };
type TomlQuotedKey = { lang: "toml"; type: "quoted key"; value: string };
type TomlDottedKey = { lang: "toml"; type: "dotted key"; value: (TomlBareKey | TomlQuotedKey)[] };
type TomlValue =
  | TomlString
  | TomlInteger
  | TomlFloat
  | TomlBoolean
  | TomlOffsetDateTime
  | TomlDateTime
  | TomlDate
  | TomlTime
  | TomlArray
  | TomlInlineTable;
type TomlString = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlInteger = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlFloat = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlBoolean = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlOffsetDateTime = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlDateTime = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlDate = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlTime = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlArray = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlInlineTable = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };

const ws: Parser<void> = (pr) => {
  const [ok, value] = $switch($word("\u0009"), $word("\u0020"))(pr);

  return ok ? [true, undefined] : [false, value];
};

const nl: Parser<void> = (pr) => {
  const [ok, value] = $switch($word("\u000A"), $word("\u000D\u000A"))(pr);

  return ok ? [true, undefined] : [false, value];
};

const tomlComment: Parser<TomlComment> = (pr) => {
  const [ok, value] = $seq(
    $word("#"),
    $while($switch($charRange(0x00_09, 0x00_09), $charRange(0x00_20, 0x00_7e), $charRange(0x00_80, 0xff_ff)), nl),
  )(pr);

  if (ok) {
    const [_, [comment]] = value;
    return [true, { lang: "toml", type: "comment", value: comment.join("") }];
  }

  return [false, value];
};

const tomlKeyValue: Parser<TomlKeyValue> = (pr) => {};
const tomlKey: Parser<TomlKey> = (pr) => {};

// A-Za-z0-9_-
const tomlBareKey: Parser<TomlBareKey> = (pr) => {
  const [ok, value] = $1orMore(
    $switch($charRange(0x41, 0x5a), $charRange(0x61, 0x7a), $charRange(0x30, 0x39), $word("_"), $word("-")),
  )(pr);

  return ok ? [true, { lang: "toml", type: "bare key", value: value.join("") }] : [false, value];
};
const tomlValue: Parser<TomlValue> = (pr) => {};

export const toml = 0;
