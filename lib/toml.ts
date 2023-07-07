import { binaryDigit, decimalDigit, hexDigit, octalDigit } from "./number";
import { char } from "./util/char";
import { either } from "./util/either";
import { eof } from "./util/eof";
import { map, as } from "./util/map";
import { opt } from "./util/opt";
import { seq } from "./util/seq";
import { word } from "./util/word";
import { $0orMore, $1orMore, $while } from "./utils";

import type { Parser } from "./util/parser";

export type TomlData = { lang: "toml"; type: "data"; value: TomlKeyValue[] };
type TomlComment = { lang: "toml"; type: "comment"; value: string };
type TomlKeyValue = { lang: "toml"; type: "key value"; value: [TomlKey, TomlValue] };

type TomlKey = TomlDottedKey;
type TomlBareKey = { lang: "toml"; type: "bare key"; value: string };
type TomlQuotedKey = { lang: "toml"; type: "quoted key"; value: TomlString };
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

type TomlString = TomlBasicString | TomlMultilineBasicString | TomlLiteralString | TomlMultilineLiteralString;
type TomlBasicString = { lang: "toml"; type: "basic string"; value: string };
type TomlMultilineBasicString = { lang: "toml"; type: "multiline basic string"; value: string };
type TomlLiteralString = { lang: "toml"; type: "literal string"; value: string };
type TomlMultilineLiteralString = { lang: "toml"; type: "multiline literal string"; value: string };

type TomlInteger = TomlDecimalInteger | TomlBinaryInteger | TomlOctalInteger | TomlHexInteger;
type TomlDecimalInteger = { lang: "toml"; type: "decimal integer"; value: number };
type TomlBinaryInteger = { lang: "toml"; type: "binary integer"; value: number };
type TomlOctalInteger = { lang: "toml"; type: "octal integer"; value: number };
type TomlHexInteger = { lang: "toml"; type: "hex integer"; value: number };

type TomlFloat = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlBoolean = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlOffsetDateTime = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlDateTime = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlDate = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlTime = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlArray = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };
type TomlInlineTable = { lang: "toml"; type: "comment"; value: [TomlKey, TomlValue] };

const ws: Parser<void> = (pr) => {
  const [ok, value] = $0orMore(either(word("\u0009"), word("\u0020")))(pr);

  return ok ? [true, undefined] : [false, value];
};

const nl: Parser<"\n"> = (pr) => {
  return as(either(word("\u000A"), word("\u000D\u000A")), "\n")(pr);
};

const tomlData: Parser<TomlData> = (pr) => {
  const [ok, value] = $0orMore(either(emptyLine, tomlComment, tomlKeyValue))(pr);

  if (!ok) return [false, value];

  const result: TomlKeyValue[] = [];

  for (const item of value) {
    if (item && item.type === "key value") {
      result.push(item);
    }
  }

  return [true, { lang: "toml", type: "data", value: result }];
};

const emptyLine: Parser<void> = (pr) => {
  const [ok, value] = seq($0orMore(ws), nl)(pr);

  return ok ? [true, undefined] : [false, value];
};

const tomlComment: Parser<TomlComment> = (pr) => {
  const [ok, value] = seq(
    word("#"),
    $while(either(word("\u0009"), char(0x00_20, 0x00_7e), char(0x00_80, 0xff_ff)), either(nl, eof)),
  )(pr);

  if (ok) {
    const [_, [comment]] = value;
    return [true, { lang: "toml", type: "comment", value: comment.join("") }];
  }

  return [false, value];
};

const tomlKeyValue: Parser<TomlKeyValue> = (pr) => {
  const [ok, value] = seq(ws, tomlKey, ws, word("="), ws, tomlValue, ws, either(tomlComment, nl, eof))(pr);

  if (!ok) return [false, value];

  const [_s1, key, _s2, _eq, _s3, v, _s4, comment] = value;

  console.log(comment);

  return [true, { lang: "toml", type: "key value", value: [key, v] }];
};

const tomlKey: Parser<TomlKey> = (pr) => {
  return tomlDottedKey(pr);
};

// A-Za-z0-9_-
const tomlBareKey: Parser<TomlBareKey> = (pr) => {
  const [ok, value] = $1orMore(either(char(0x41, 0x5a), char(0x61, 0x7a), char(0x30, 0x39), word("_"), word("-")))(pr);

  return ok ? [true, { lang: "toml", type: "bare key", value: value.join("") }] : [false, value];
};

const tomlQuotedKey: Parser<TomlQuotedKey> = (pr) => {
  const [ok, value] = tomlString(pr);

  return ok ? [true, { lang: "toml", type: "quoted key", value }] : [false, value];
};

const tomlDottedKey: Parser<TomlDottedKey> = (pr) => {
  const [ok, value] = seq(
    either(tomlBareKey, tomlQuotedKey),
    $0orMore(seq(ws, word("."), ws, either(tomlBareKey, tomlQuotedKey))),
  )(pr);

  if (!ok) {
    return [false, value];
  }

  const [first, rest] = value;

  const result = [first];

  for (const [_s1, _dot, _s2, item] of rest) {
    result.push(item);
  }

  return [true, { lang: "toml", type: "dotted key", value: result }];
};

const tomlValue: Parser<TomlValue> = (pr) => {
  return either(tomlString, tomlInteger)(pr);
};

const tomlString: Parser<TomlString> = (pr) => {
  return either(tomlBasicString, tomlMultilineBasicString, tomlLiteralString, tomlMultilineLiteralString)(pr);
};

const tomlCharacter: Parser<string> = (pr) => {
  return either(
    // U+0000 - U+0008 control characters
    word("\u0009"), // U+0009 TAB
    // U+000A - U+001F control characters
    char(0x00_20, 0x00_21),
    // U+0022 double quote
    char(0x00_23, 0x00_26),
    // U+0027 single quote
    char(0x00_28, 0x00_5b),
    // U+005C backslash
    char(0x00_5d, 0x00_7e),
    // U+007F control character
    char(0x00_80, 0xff_ff),
  )(pr);
};

const tomlEscapeCharacter: Parser<string> = (pr) => {
  return either(
    map(word("\\b"), () => "\u0008"),
    map(word("\\t"), () => "\u0009"),
    map(word("\\n"), () => "\u000A"),
    map(word("\\f"), () => "\u000C"),
    map(word("\\r"), () => "\u000D"),
    map(word('\\"'), () => "\u0022"),
    map(word("\\\\"), () => "\u005C"),
    map(seq(word("\\u"), hexDigit, hexDigit, hexDigit, hexDigit), ([_u, h1, h2, h3, h4]) => {
      return String.fromCodePoint((h1 << 12) | (h2 << 8) | (h3 << 4) | h4);
    }),
    map(
      seq(word("\\U"), hexDigit, hexDigit, hexDigit, hexDigit, hexDigit, hexDigit, hexDigit, hexDigit),
      ([_u, h1, h2, h3, h4, h5, h6, h7, h8]) => {
        const code = (h1 << 28) | (h2 << 24) | (h3 << 20) | (h4 << 16) | (h5 << 12) | (h6 << 8) | (h7 << 4) | h8;

        return String.fromCodePoint(code);
      },
    ),
  )(pr);
};

const tomlBasicString: Parser<TomlBasicString> = (pr) => {
  const [ok, value] = seq(word('"'), $0orMore(either(tomlCharacter, word("'"), tomlEscapeCharacter)), word('"'))(pr);

  if (!ok) return [false, value];

  const [_startQuote, contain, _endQuote] = value;

  return [true, { lang: "toml", type: "basic string", value: contain.join("") }];
};

const tomlMultilineBasicString: Parser<TomlMultilineBasicString> = (pr) => {
  const [ok, value] = seq(
    word('"""'),
    $0orMore(
      either(
        tomlCharacter,
        word("'"),
        word('"'),
        tomlEscapeCharacter,
        nl,
        as(seq(word("\\"), nl, $0orMore(either(ws, nl))), ""),
      ),
    ),
    word('"""'),
  )(pr);

  if (!ok) return [false, value];

  const [_startQuote, contain, _endQuote] = value;

  return [true, { lang: "toml", type: "multiline basic string", value: contain.join("") }];
};

const tomlLiteralString: Parser<TomlLiteralString> = (pr) => {
  const [ok, value] = seq(word("'"), $0orMore(either(tomlCharacter, word('"'), word("\\"))), word("'"))(pr);

  if (!ok) return [false, value];

  const [_startQuote, contain, _endQuote] = value;

  return [true, { lang: "toml", type: "literal string", value: contain.join("") }];
};

const tomlMultilineLiteralString: Parser<TomlMultilineLiteralString> = (pr) => {
  const [ok, value] = seq(
    word("'''"),
    $0orMore(either(tomlCharacter, word("'"), word('"'), word("\\"), nl)),
    word("'''"),
  )(pr);

  if (!ok) return [false, value];

  const [_startQuote, contain, _endQuote] = value;

  return [true, { lang: "toml", type: "multiline literal string", value: contain.join("") }];
};

const tomlInteger: Parser<TomlInteger> = (pr) => {
  return either(tomlDecimalInteger, tomlBinaryInteger, tomlOctalInteger, tomlHexInteger)(pr);
};

const underscoreSeparatedNumber =
  (parser: Parser<number>, radix: number): Parser<number> =>
  (pr) => {
    return map(
      seq(parser, $0orMore(parser), $0orMore(seq(word("_"), $1orMore(parser)))),
      ([first, rest, separated]) => {
        let result: number = first;

        for (const number of rest) {
          result = result * radix + number;
        }

        for (const [_us, numbers] of separated) {
          for (const number of numbers) {
            result = result * radix + number;
          }
        }

        return result;
      },
    )(pr);
  };

const tomlDecimalInteger: Parser<TomlDecimalInteger> = (pr) => {
  const [ok, value] = seq(
    either(as(word("+"), +1), as(word("-"), -1), as(word(""), +1)),
    either(as(word("0"), 0), underscoreSeparatedNumber(decimalDigit, 10)),
  )(pr);

  if (!ok) {
    return [false, value];
  }

  const [sign, int] = value;

  return [true, { lang: "toml", type: "decimal integer", value: sign * int }];
};

const tomlBinaryInteger: Parser<TomlBinaryInteger> = (pr) => {
  const [ok, value] = seq(
    opt(as(word("-"), -1)),
    word("0b"),
    either(as(word("0"), 0), underscoreSeparatedNumber(binaryDigit, 2)),
  )(pr);

  if (!ok) {
    return [false, value];
  }

  const [sign, _prefix, int] = value;

  return [true, { lang: "toml", type: "binary integer", value: (sign ?? 1) * int }];
};

const tomlOctalInteger: Parser<TomlOctalInteger> = (pr) => {
  const [ok, value] = seq(
    opt(as(word("-"), -1)),
    word("0o"),
    either(as(word("0"), 0), underscoreSeparatedNumber(octalDigit, 8)),
  )(pr);

  if (!ok) {
    return [false, value];
  }

  const [sign, _prefix, int] = value;

  return [true, { lang: "toml", type: "octal integer", value: (sign ?? 1) * int }];
};

const tomlHexInteger: Parser<TomlHexInteger> = (pr) => {
  const [ok, value] = seq(
    opt(as(word("-"), -1)),
    word("0x"),
    either(as(word("0"), 0), underscoreSeparatedNumber(hexDigit, 16)),
  )(pr);

  if (!ok) {
    return [false, value];
  }

  const [sign, _prefix, int] = value;

  return [true, { lang: "toml", type: "hex integer", value: (sign ?? 1) * int }];
};

export const toml = emptyLine;
