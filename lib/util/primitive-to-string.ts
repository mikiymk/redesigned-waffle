/**
 * JavaScriptのプリミティブ値を判別可能な固有の文字列に変換します。
 * @param value 文字列に変換する値
 * @returns 変換された文字列
 */
export const primitiveToString = (value: string | number | boolean | bigint | symbol | null | undefined): string => {
  switch (typeof value) {
    case "string": {
      return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
    }

    case "number":
    case "boolean":
    case "undefined":
    case "object": {
      return `${value}`;
    }

    case "bigint": {
      return `${value}n`;
    }

    case "symbol": {
      return `Symbol(${primitiveToString(value.description)})`;
    }
  }
};
