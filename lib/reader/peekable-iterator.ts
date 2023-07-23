type Success<T> = readonly [isSuccess: true, value: T];
type Failure<E extends Error> = readonly [isSuccess: false, value: E];
export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

export type PeekableIterator<T, TReturn = unknown, TNext = undefined> = Iterator<T, TReturn, TNext> & {
  peek(...nextArguments: [] | [TNext]): IteratorResult<T, TReturn>;
};
