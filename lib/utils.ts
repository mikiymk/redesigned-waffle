import { EOF, get, clone, setPosition } from "./reader";

import type { ParseReader } from "./reader";

type Success<T> = readonly [isSuccess: true, value: T];
type Failure<E extends Error> = readonly [isSuccess: false, value: E];
type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

export type Parser<T> = (pr: ParseReader) => Result<T>;

// eslint-disable-next-line import/no-unused-modules
export const $const =
	<T>(value: T): Parser<T> =>
	(): Success<T> =>
		[true, value];

export const $word =
	<T extends string>(word: T): Parser<T> =>
	(pr: ParseReader): Result<T> => {
		const readChars = [];

		for (const _ of word) {
			const readChar = get(pr);

			if (readChar === EOF) {
				return [false, new Error("reach to end of string")];
			}

			readChars.push(readChar);
		}

		const readString = readChars.join("");
		return word === readString
			? [true, readString as T]
			: [false, new Error("not expected")];
	};

export const $charRange =
	(min: number, max: number) => (pr: ParseReader): Result<string> => {
		const char = get(pr);

		if (char === EOF) {
			return [false, new Error("reach to end of string")];
		}

		// eslint-disable-next-line unicorn/prefer-code-point
		const charCode = char.charCodeAt(0);

		return min < charCode && charCode < max
			? [true, char]
			: [
					false,
					new Error(
						`char ${char}(U+${("000" + charCode.toString(16)).slice(
							-4,
						)}) is not in range`,
					),
			  ];
	};

export const $0or1 =
	<T>(parser: Parser<T>) =>
	(pr: ParseReader): Result<T | undefined> => {
		const [ok, value] = parser(pr);

		return ok ? [true, value] : [true, undefined];
	};

export const $0orMore = <T>(parser: Parser<T>) =>
	$NtoM(parser, 0, Number.POSITIVE_INFINITY);
export const $1orMore = <T>(parser: Parser<T>) =>
	$NtoM(parser, 1, Number.POSITIVE_INFINITY);

const $NtoM =
	<T>(parser: Parser<T>, n: number, m: number) =>
	(pr: ParseReader): Result<T[]> => {
		const result = [];
		for (let index = 0; index < n; index++) {
			const [contOk, cont] = parser(pr);

			if (!contOk) {
				return [false, new Error(`not reached ${n}`, { cause: cont })];
			}

			result.push(cont);
		}

		for (let index = 0; index < m - n; index++) {
			const [contOk, cont] = parser(pr);

			if (!contOk) {
				break;
			}

			result.push(cont);
		}

		return [true, result];
	};

type ParserValuesUnion<Ps extends Parser<unknown>[]> = {
	[K in keyof Ps]: Ps[K] extends Parser<infer R> ? R : never;
}[number];
export const $switch =
	<Ps extends Parser<unknown>[]>(...conditions: Ps) =>
	(pr: ParseReader): Result<ParserValuesUnion<Ps>> => {
		for (const parser of conditions) {
			const [ok, value] = parser(pr);
			if (ok) {
				return [true, value as ParserValuesUnion<Ps>];
			}
		}

		return [false, new Error("uncaught condition")];
	};

type ParserValuesTuple<Ps extends Parser<unknown>[]> = {
	[K in keyof Ps]: Ps[K] extends Parser<infer R> ? R : never;
};
export const $seq =
	<Ps extends Parser<unknown>[]>(...parsers: Ps) =>
	(pr: ParseReader): Result<ParserValuesTuple<Ps>> => {
		const result = [];

		for (const parser of parsers) {
			const [ok, value] = parser(pr);
			if (!ok) {
				return [false, value];
			}

			result.push(value);
		}

		return [true, result as ParserValuesTuple<Ps>];
	};

export const $proc =
	<T, U>(parser: Parser<T>, function_: (value: T) => U): Parser<U> =>
	(pr: ParseReader): Result<U> => {
		const [ok, value] = parser(pr);

		return ok ? [true, function_(value)] : [false, value];
	};

export const $try =
	<T>(parser: Parser<T>) =>
	(pr: ParseReader): Result<T> => {
		const cloned = clone(pr);
		const [ok, value] = parser(cloned);

		if (ok) {
			setPosition(pr, cloned);
			return [true, value];
		} else {
			return [false, value];
		}
	};
