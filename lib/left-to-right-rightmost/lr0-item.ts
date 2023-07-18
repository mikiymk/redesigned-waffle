import type { LR0ItemToken, Rule, SyntaxToken } from "../left-to-right-leftmost/define-rules";

export type LR0Item = {
  name: string;
  tokens: LR0ItemToken[];
  position: number;
};

/**
 * 構文ルールから先頭にドットトークンを追加したLR(0)アイテムを作る
 * ```
 * E → E + B
 * ⇓
 * E → • E + B
 * ```
 * @param rule ルール
 * @returns LR(0)アイテムのリスト
 */
export const getLR0Item = (rule: Rule): LR0Item => {
  const name = rule[0];

  // 空白トークンは無視する
  const tokens: LR0ItemToken[] = rule[1].filter(
    (token): token is Exclude<SyntaxToken, ["epsilon"]> => token[0] !== "epsilon",
  );

  return {
    name,
    tokens,
    position: 0,
  };
};
