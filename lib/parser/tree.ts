export type Tree<T> = string | { index: number; children: Tree<T>[]; processed: T };
