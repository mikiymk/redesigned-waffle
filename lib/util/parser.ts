import type { ParseReader } from "../core/reader";

type Success<T> = readonly [isSuccess: true, value: T];
type Failure<E extends Error> = readonly [isSuccess: false, value: E];
export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

export type Parser<T> = (pr: ParseReader) => Result<T>;
