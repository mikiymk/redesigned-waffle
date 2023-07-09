import { epsilon, reference, rule, word } from "@/lib/left-to-right-leftmost/define-rules";

export const calculatorSyntax = [
  rule("start", reference("expression")),

  rule("expression", reference("add")),

  rule("add", reference("add"), word("+"), reference("multiply")),

  rule("multiply", reference("multiply"), word("*"), reference("primary")),

  rule("primary", reference("ws"), reference("number"), reference("ws")),
  rule("primary", reference("expression")),

  rule("number", word("0")),
  rule("number", word("1")),

  rule("ws", epsilon),
  rule("ws", word(" "), reference("ws")),
];
