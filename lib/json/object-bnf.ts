// https://www.json.org/json-en.html
// https://www.ecma-international.org/publications-and-standards/standards/ecma-404/
// https://www.ecma-international.org/wp-content/uploads/ECMA-404_2nd_edition_december_2017.pdf

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

type SyntaxRule<S extends Syntax> = S extends string
  ? S extends ""
    ? "ε"
    : S extends "|"
    ? "'|'"
    : S extends ","
    ? "','"
    : S
  : S extends readonly ["or", infer F extends Syntax, ...infer R extends Syntax[]]
  ? R extends []
    ? `${SyntaxRule<F>}`
    : `${SyntaxRule<F>} | ${SyntaxRule<["or", ...R]>}`
  : S extends readonly ["and", infer F extends Syntax, ...infer R extends Syntax[]]
  ? R extends []
    ? `${SyntaxRule<F>}`
    : `${SyntaxRule<F>} , ${SyntaxRule<["and", ...R]>}`
  : S extends readonly ["symbol", infer R extends string]
  ? `<${R}>`
  : S extends readonly ["char", infer N extends number, infer M extends number]
  ? `${N} . ${M}`
  : "";

type SyntaxToString<Ss extends Record<string, Syntax>> = {
  -readonly [K in keyof Ss]: SyntaxRule<Ss[K]>;
};

type AS = SyntaxToString<typeof jsonSyntax>["ws"];

const n: AS = "ε |   , <ws> | \n , <ws> | \r , <ws> | \t , <ws>";
console.log(n);
