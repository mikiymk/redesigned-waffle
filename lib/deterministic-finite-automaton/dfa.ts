import { zip } from "../util/zip-array";

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
   * @returns パーティションに分けられた状態番号を返す
   */
  minimization() {
    let partition = [
      [...this.states.keys()].filter((key) => this.acceptStates.includes(key)),
      [...this.states.keys()].filter((key) => !this.acceptStates.includes(key)),
    ];

    for (;;) {
      const nextPartition = this.getNextPartition(partition);
      if (equalsPartition(partition, nextPartition)) {
        partition = nextPartition;
        break;
      } else {
        partition = nextPartition;
      }
    }

    return partition;
  }

  /**
   *
   * @param partition 前のパーティション
   * @returns 次のパーティション
   */
  getNextPartition(partition: number[][]): number[][] {
    const newPartition = [];

    for (const group of partition) {
      // パーティションの先を見て、同じパーティションのグループを作る
      const groups: Record<string, number[]> = {};

      for (const state of group) {
        const transition = this.transition[state];
        const targetPartitionSet = new Set<number>();

        if (!transition) {
          continue;
        }

        for (const target of Object.values(transition)) {
          for (const [index, group] of zip(partition)) {
            if (group.includes(target)) {
              targetPartitionSet.add(index);
              break;
            }
          }
        }

        const targetPartitionList = [...targetPartitionSet].sort().join(",");

        const targetGroup = groups[targetPartitionList] ?? [];
        groups[targetPartitionList] = targetGroup;
        targetGroup.push(state);
      }

      newPartition.push(...Object.values(groups));
    }

    return newPartition;
  }
}

/**
 *
 * @param left 左側のパーティション
 * @param right 右側のパーティション
 * @returns ２つのパーティションが同じなら、true
 */
const equalsPartition = (left: number[][], right: number[][]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  for (const [_, lItem, rItem] of zip(left, right)) {
    if (lItem.length !== rItem.length) {
      return false;
    }

    for (const [_, llItem, rrItem] of zip(lItem, rItem)) {
      if (llItem !== rrItem) {
        return false;
      }
    }
  }

  return true;
};
