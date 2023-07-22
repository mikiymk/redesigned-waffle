/**
 *
 * @param value
 * @returns
 */
export const primitiveToString = (value: string | number | boolean | bigint | symbol | null | undefined): string => {
  switch (typeof value) {
    case "string": {
      return `"${value.replaceAll('"', '\\"').replaceAll("\\", "\\\\")}"`;
    }

    case "number":
    case "bigint":
    case "boolean":
    case "undefined":
    case "object": {
      return `${value}`;
    }

    case "symbol": {
      return `Symbol(${primitiveToString(value.description)})`;
    }
  }
};
