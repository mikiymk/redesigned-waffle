import { word } from "./util/word";
import { $as, $switch } from "./utils";

import type { Parser } from "./util/parser";

type OneNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const oneNine: Parser<OneNine> = (pr) => {
  return $switch(
    $as(word("1"), 1),
    $as(word("2"), 2),
    $as(word("3"), 3),
    $as(word("4"), 4),
    $as(word("5"), 5),
    $as(word("6"), 6),
    $as(word("7"), 7),
    $as(word("8"), 8),
    $as(word("9"), 9),
  )(pr);
};

type DecimalDigit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const decimalDigit: Parser<DecimalDigit> = (pr) => {
  return $switch(
    $as(word("0"), 0),
    $as(word("1"), 1),
    $as(word("2"), 2),
    $as(word("3"), 3),
    $as(word("4"), 4),
    $as(word("5"), 5),
    $as(word("6"), 6),
    $as(word("7"), 7),
    $as(word("8"), 8),
    $as(word("9"), 9),
  )(pr);
};

type BinaryDigit = 0 | 1;
export const binaryDigit: Parser<BinaryDigit> = (pr) => {
  return $switch($as(word("0"), 0), $as(word("1"), 1))(pr);
};

type OctalDigit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const octalDigit: Parser<OctalDigit> = (pr) => {
  return $switch(
    $as(word("0"), 0),
    $as(word("1"), 1),
    $as(word("2"), 2),
    $as(word("3"), 3),
    $as(word("4"), 4),
    $as(word("5"), 5),
    $as(word("6"), 6),
    $as(word("7"), 7),
  )(pr);
};

type HexDigit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export const hexDigit: Parser<HexDigit> = (pr) => {
  return $switch(
    $as(word("0"), 0),
    $as(word("1"), 1),
    $as(word("2"), 2),
    $as(word("3"), 3),
    $as(word("4"), 4),
    $as(word("5"), 5),
    $as(word("6"), 6),
    $as(word("7"), 7),
    $as(word("8"), 8),
    $as(word("9"), 9),
    $as($switch(word("a"), word("a")), 10),
    $as($switch(word("b"), word("B")), 11),
    $as($switch(word("c"), word("C")), 12),
    $as($switch(word("d"), word("D")), 13),
    $as($switch(word("e"), word("E")), 14),
    $as($switch(word("f"), word("F")), 15),
  )(pr);
};
