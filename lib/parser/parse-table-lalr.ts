import { eof } from "../rules/define-rules";
import { ReferenceToken } from "../rules/reference-token";
import { ObjectSet } from "../util/object-set";
import { zip } from "../util/zip-array";

import { ParseBuilder } from "./parse-builder";

import type { GrammarRules, RuleItem } from "./grammar-rules";
import type { Tokens } from "./tokens";
import type { DirectorSetToken, FollowSetToken } from "../rules/define-rules";

/**
 * LALR(1)アイテム
 *
 * A → a . b [x, y]
 * 1つの文法規則と、読まれた場所をマークする'.'(ドット)、先読み終端記号のリストで構成されます。
 */
class LaLRItem {
  readonly tokens: Tokens;
  readonly rules: GrammarRules;

  readonly rule: RuleItem;
  readonly ruleNumber: number;
  readonly position: number;
  readonly lookaheadTerminalSymbols: ObjectSet<FollowSetToken>;

  /**
   * 新しいアイテムを作成する
   * @param tokens トークン辞書
   * @param rules ルール辞書
   * @param rule ルール番号
   * @param position 位置
   * @param lookaheadTerminalSymbols 先読み集合
   */
  constructor(
    tokens: Tokens,
    rules: GrammarRules,
    rule: number,
    position: number,
    lookaheadTerminalSymbols: Iterable<FollowSetToken>,
  ) {
    this.tokens = tokens;
    this.rules = rules;
    this.ruleNumber = rule;
    this.rule = rules.get(this.ruleNumber);
    this.position = position;
    this.lookaheadTerminalSymbols = new ObjectSet(lookaheadTerminalSymbols);
  }

  /**
   *
   * @returns 次があれば新しいアイテム
   */
  next(): LaLRItem | undefined {
    if (this.rule.tokens.length <= this.position) {
      return undefined;
    }

    return new LaLRItem(this.tokens, this.rules, this.ruleNumber, this.position + 1, this.lookaheadTerminalSymbols);
  }

  /**
   * ドットの次のトークンの番号を返す
   * @returns 次のトークン番号
   */
  nextToken(): number | undefined {
    for (const token of this.rule.tokens.slice(this.position)) {
      if (!this.tokens.isEmpty(token)) {
        return this.tokens.indexOf(token);
      }
    }

    return;
  }

  #keyString: string | undefined;
  /**
   * 集合のキー用文字列を返す
   * @returns キー文字列
   */
  toKeyString(): string {
    if (!this.#keyString) {
      const symbols = [...this.lookaheadTerminalSymbols].map((token) => token.toKeyString()).join("");
      this.#keyString = `item ${this.ruleNumber} ${this.position} [${symbols}]`;
    }
    return this.#keyString;
  }
}

/**
 * パース表の行
 */
class LaLRParseTableRow {
  readonly kernels: ObjectSet<LaLRItem>;
  readonly additions: ObjectSet<LaLRItem>;
  readonly gotoMap: [number, number][] = [];

  readonly tokens;
  readonly rules;

  #reduce: [ObjectSet<DirectorSetToken>, number][] = [];
  #accept: [ObjectSet<DirectorSetToken>, number][] = [];
  #shift: [number, number][] = [];
  #goto: [number, number][] = [];

  /**
   * 1つのアイテム集合を作ります。
   * @param tokens トークン辞書
   * @param rules ルール辞書
   * @param items LALR(1)アイテムリスト
   */
  constructor(tokens: Tokens, rules: GrammarRules, items: Iterable<LaLRItem>) {
    this.tokens = tokens;
    this.rules = rules;

    this.kernels = new ObjectSet<LaLRItem>(items);
    this.additions = new ObjectSet<LaLRItem>();

    for (const rule of this.closure(this.kernels)) {
      this.additions.add(new LaLRItem(this.tokens, this.rules, rule, 0, []));
    }

    // このアイテム集合のフォロー集合を求める
    const itemSetRules = [...this.kernels, ...this.additions].map((item) => item.rule);

    const followSet = new ParseBuilder(itemSetRules.map((item) => [item.name, item.tokens])).followSets;
    const lookahead: Record<string | symbol, ObjectSet<FollowSetToken>> = {};

    for (const [_, rule, set] of zip(itemSetRules, followSet.followSets)) {
      if (set) {
        lookahead[rule.name] = set;
      }
    }

    // 各アイテムにフォロー集合のトークンを追加する
    for (const item of [...this.kernels, ...this.additions]) {
      const set = lookahead[item.rule.name];
      if (set) item.lookaheadTerminalSymbols.append(set);
    }
  }

  /**
   * LALR(1)アイテムのクロージャ操作。
   * 次のトークンが非終端記号の場合、その非終端記号を左辺に含む文法規則をLALR(1)アイテム集合に追加する。
   * @param items LALR(1)アイテムリスト
   * @returns ルール番号リスト
   */
  closure(items: Iterable<LaLRItem>): number[] {
    for (const item of items) {
      // アイテムからドットの後ろのトークンを得る
      const nextItemNumber = item.nextToken();

      if (nextItemNumber !== undefined) {
        const nextItem = this.tokens.get(nextItemNumber);

        if (nextItem instanceof ReferenceToken) {
          // 次のトークンが非終端記号なら
          return this.rules.expansion(nextItem.name);
        }
      }
    }

    return [];
  }

  /**
   * アイテムを次のトークンで分類します。
   * @returns 最初のトークン別のアイテム集合
   */
  groups(): [number, ObjectSet<LaLRItem>][] {
    const record = new Map<number, ObjectSet<LaLRItem>>();

    for (const item of [...this.kernels, ...this.additions]) {
      const tokenNumber = item.nextToken();

      if (tokenNumber === undefined) {
        // ドットの後ろにトークンがない状態は、空のルールから生まれる。
        // 空のルールはクロージャ操作で新しいアイテムを生まないはずなので、スキップできる。
        continue;
      }

      const set = record.get(tokenNumber) ?? new ObjectSet();
      set.add(item);
      record.set(tokenNumber, set);
    }

    return [...record];
  }

  /**
   * テーブルを完成させます
   */
  collect(): void {
    // reduceとacceptを調べる
    for (const item of [...this.kernels, ...this.additions]) {
      if (item.next() === undefined) {
        // アイテムが最後なら

        // ルール番号を調べる
        const ruleNumber = item.ruleNumber;

        if (ruleNumber === 0) {
          // 初期状態の場合はaccept
          this.#accept.push([item.lookaheadTerminalSymbols, ruleNumber]);
        } else {
          // その他のルールではreduce
          this.#reduce.push([item.lookaheadTerminalSymbols, ruleNumber]);
        }
      }
    }

    // shiftを調べる
    for (const [token, number] of this.gotoMap) {
      if (this.tokens.get(token) instanceof ReferenceToken) {
        this.#goto.push([token, number]);
      } else {
        this.#shift.push([token, number]);
      }
    }
  }
}

/**
 *
 */
// eslint-disable-next-line import/no-unused-modules
export class LaLRParseTable {
  readonly tokens: Tokens;
  readonly rules: GrammarRules;

  readonly table: LaLRParseTableRow[] = [];

  /**
   *
   * @param tokens トークン辞書
   * @param rules ルール辞書
   */
  constructor(tokens: Tokens, rules: GrammarRules) {
    this.tokens = tokens;
    this.rules = rules;

    this.initialize();
  }

  /**
   *
   */
  initialize() {
    const firstItem = new LaLRItem(this.tokens, this.rules, 0, 0, [eof]);

    this.table.push(new LaLRParseTableRow(this.tokens, this.rules, [firstItem]));

    for (const row of this.table) {
      // アイテム集合をグループ分けする
      const groups = row.groups();

      // 各グループについて
      outer: for (const [token, itemSet] of groups) {
        const next = new ObjectSet(
          [...itemSet].map((item) => item.next()).filter((value): value is LaLRItem => value !== undefined),
        );

        // もし既存のアイテム集合に同じものがあったら
        // 新しく追加しない
        for (const [index, { kernels }] of this.table.entries()) {
          if (kernels.equals(next)) {
            row.gotoMap.push([token, index]);
            continue outer;
          }
        }

        row.gotoMap.push([token, this.table.length]);
        this.table.push(new LaLRParseTableRow(this.tokens, this.rules, next));
      }

      row.collect();
    }
  }
}
