import type { ParseTableRow } from "../left-to-right-rightmost/parse-table-row";
import type { LR0ItemToken } from "../rules/define-rules";

/**
 *
 */
export class DFA<T> {
  states: ParseTableRow<T>[];
  symbols: LR0ItemToken[];
  initialState: number;
  transition: Record<number, Record<number, number>>;
  acceptStates: number[];

  /**
   *
   * @param states 状態集合
   * @param symbols 文字集合
   * @param initialState 初期状態
   * @param transition 遷移関数
   * @param acceptStates 受理状態
   */
  constructor(
    states: ParseTableRow<T>[],
    symbols: LR0ItemToken[],
    initialState: number,
    transition: Record<number, Record<number, number>>,
    acceptStates: number[],
  ) {
    this.states = states;
    this.symbols = symbols;
    this.initialState = initialState;
    this.transition = transition;
    this.acceptStates = acceptStates;
  }

  /**
   *
   */
  minimization() {
    // todo
  }
}
