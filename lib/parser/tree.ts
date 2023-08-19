export type Tree<T> = TreeLeaf | TreeBranch<T>;
export type TreeLeaf = string;
export type TreeBranch<T> = {
  index: number;
  children: Tree<T>[];
  processed: T;
};
