// https://www.json.org/json-en.html
// https://www.ecma-international.org/publications-and-standards/standards/ecma-404/
// https://www.ecma-international.org/wp-content/uploads/ECMA-404_2nd_edition_december_2017.pdf

import { EOF, clone, get, setPosition } from "../core/reader";

import type { Parser } from "../util/parser";

type Syntax =
  | string
  | readonly ["char", number, number]
  | readonly ["symbol", string]
  | readonly ["or", ...Syntax[]]
  | readonly ["and", ...Syntax[]];

// eslint-disable-next-line import/no-unused-modules
export const jsonSyntax = {
  start: ["symbol", "element"],

  value: [
    "or",
    ["symbol", "object"],
    ["symbol", "array"],
    ["symbol", "string"],
    ["symbol", "array"],
    "true",
    "false",
    "null",
  ],

  object: ["or", ["and", "{", ["symbol", "ws"], "}"], ["and", "{", ["symbol", "members"], "}"]],
  members: ["or", ["symbol", "member"], ["and", ["symbol", "member"], ",", ["symbol", "members"]]],
  member: ["and", ["symbol", "ws"], ["symbol", "string"], ["symbol", "ws"], ":", ["symbol", "element"]],
  array: ["or", ["and", "[", ["symbol", "ws"], "]"], ["and", "[", ["symbol", "elements"], "]"]],
  elements: ["or", ["symbol", "element"], ["and", ["symbol", "element"], ",", ["symbol", "elements"]]],
  element: ["and", ["symbol", "ws"], ["symbol", "value"], ["symbol", "ws"]],
  string: ["and", '"', ["symbol", "characters"], '"'],
  characters: ["or", "", ["and", ["symbol", "character"], ["symbol", "characters"]]],
  character: [
    "or",
    ["char", 0x00_20, 0x00_21],
    ["char", 0x00_23, 0x00_5b],
    ["char", 0x00_5d, 0x10_ff_ff],
    ["and", "\\", ["symbol", "escape"]],
  ],
  escape: [
    "or",
    '"',
    "\\",
    "/",
    "b",
    "f",
    "n",
    "r",
    "t",
    ["and", "u", ["symbol", "hex"], ["symbol", "hex"], ["symbol", "hex"], ["symbol", "hex"]],
  ],
  hex: ["or", ["symbol", "digit"], ["char", 0x41, 0x5a], ["char", 0x61, 0x7a]],
  number: ["and", ["symbol", "integer"], ["symbol", "fraction"], ["symbol", "exponent"]],
  integer: [
    "or",
    ["symbol", "digit"],
    ["and", ["symbol", "onenine"], ["symbol", "digits"]],
    ["and", "-", ["symbol", "digit"]],
    ["and", "-", ["symbol", "onenine"], ["symbol", "digits"]],
  ],

  digits: ["or", ["symbol", "digit"], ["and", ["symbol", "digit"], ["symbol", "digits"]]],
  digit: ["or", "0", ["symbol", "onenine"]],
  onenine: ["char", 0x31, 0x39],
  fraction: ["or", "", ["and", ".", ["symbol", "digits"]]],
  exponent: [
    "or",
    "",
    ["and", "E", ["symbol", "sign"], ["symbol", "digits"]],
    ["and", "e", ["symbol", "sign"], ["symbol", "digits"]],
  ],
  sign: ["or", "", "+", "-"],

  ws: [
    "or",
    "",
    ["and", "\u0020", ["symbol", "ws"]],
    ["and", "\u000A", ["symbol", "ws"]],
    ["and", "\u000D", ["symbol", "ws"]],
    ["and", "\u0009", ["symbol", "ws"]],
  ],
} as const satisfies Record<string, Syntax>;

type ParseResult = string | ParseResult[];

/**
 *
 * @param syntax 構文
 * @returns パーサー
 */
// eslint-disable-next-line import/no-unused-modules
export const generateParser = (syntax: Record<string, Syntax>): Parser<ParseResult> => {
  const keys = new Set(Object.keys(syntax));
  const flattenSyntax = normalizeSyntax(syntax);
  const parsers: Record<string, Parser<ParseResult>> = {};

  for (const key in syntax) {
    const value = syntax[key];

    if (value === undefined) {
      console.warn(`undefined key ${key}`);
      continue;
    }

    parsers[key] = generateParserFromRule(value, keys, parsers);
  }

  if ("start" in parsers) {
    return parsers["start"];
  }

  throw new Error("no start rule in form");
};

type FlattenRulesTerminate = string | ["internal char", number, number] | ["internal symbol", string];
type FlattenRulesAnd = ["internal and", ...FlattenRulesTerminate[]];
type FlattenRulesOr = ["internal or", ...FlattenRulesAnd[]];

const normalizeSyntax = (syntax: Record<string, Syntax>): (readonly [string, ...FlattenRulesTerminate[]])[] => {
  const flattenSyntax = [];
  for (const ruleName in syntax) {
    const rule = syntax[ruleName];
    if (rule === undefined) continue;
    const [_, ...flatten] = normalizeSyntaxRule(rule);

    for (const [_, ...andRule] of flatten) {
      flattenSyntax.push([ruleName, ...andRule] as const);
    }
  }

  console.log(flattenSyntax);

  return flattenSyntax;
};
const normalizeSyntaxRule = (syntax: Syntax): FlattenRulesOr => {
  if (typeof syntax === "string") {
    return ["internal or", ["internal and", syntax]];
  }

  switch (syntax[0]) {
    case "char": {
      return ["internal or", ["internal and", ["internal char", syntax[1], syntax[2]]]];
    }

    case "and": {
      const [_, ...rest] = syntax;
      let result: FlattenRulesAnd[] = [["internal and"]];
      for (const [_, ...rule] of rest.map((element) => normalizeSyntaxRule(element))) {
        const newResult: FlattenRulesAnd[] = [];
        for (const [_, ...previousItem] of result) {
          for (const [_, ...newItem] of rule) {
            newResult.push(["internal and", ...previousItem, ...newItem]);
          }
        }

        result = newResult;
      }
      return ["internal or", ...result];
    }
    case "or": {
      const [_, ...rest] = syntax;
      let result: FlattenRulesAnd[] = [];
      for (const rule of rest) {
        const [_, ...flatten] = normalizeSyntaxRule(rule);

        result = [...result, ...flatten];
      }

      return ["internal or", ...result];
    }
    case "symbol": {
      return ["internal or", ["internal and", ["internal symbol", syntax[1]]]];
    }

    default: {
      return syntax;
    }
  }
};

const generateParserFromRule = (
  value: Syntax,
  ruleNames: Set<string>,
  parsers: Record<string, Parser<ParseResult>>,
): Parser<ParseResult> => {
  if (typeof value === "string") {
    return (pr) => {
      const readChars = [];

      for (const _ of value) {
        const readChar = get(pr);

        if (readChar === EOF) {
          return [false, new Error(`expect "${value}" but "${readChars.join("")}"`)];
        }

        readChars.push(readChar);
      }

      const readString = readChars.join("");

      return value === readString ? [true, readString] : [false, new Error(`expect "${value}" but "${readString}"`)];
    };
  }

  switch (value[0]) {
    case "symbol": {
      const [_, referenceName] = value;
      if (!ruleNames.has(referenceName)) {
        throw new Error(`reference rule "${referenceName}" is not found`);
      }

      return (pr) => parsers[referenceName]!(pr);
    }

    case "char": {
      const [_, min, max] = value;

      return (pr) => {
        const char = get(pr);
        if (char === EOF) {
          return [false, new Error("reach to end of string")];
        }

        const charCode = char.codePointAt(0);

        return charCode && min <= charCode && charCode <= max
          ? [true, char]
          : [false, new Error(`expect char in ${min}..${max} but ${char}`)];
      };
    }

    case "and": {
      const [_, ...rules] = value;

      const generatedParsers = rules.map((rule) => generateParserFromRule(rule, ruleNames, parsers));

      return (pr) => {
        const result = [];
        for (const parser of generatedParsers) {
          const [ok, value] = parser(pr);

          if (!ok) return [ok, value];
          result.push(value);
        }
        return [true, result];
      };
    }

    case "or": {
      const [_, ...rules] = value;

      const generatedParsers = rules.map((rule) => generateParserFromRule(rule, ruleNames, parsers));

      return (pr) => {
        const errors = [];
        for (const parser of generatedParsers) {
          const cloned = clone(pr);
          const [ok, value] = parser(cloned);

          if (ok) {
            setPosition(pr, cloned);
            return [ok, value];
          }
          errors.push(value);
        }

        return [false, new Error(errors.map((error) => `${error.name}: ${error.message}`).join("\n"))];
      };
    }

    // No default
  }
};

// const jsonParser = generateParser(jsonSyntax);
