export const EOL = Symbol("EOL");

export class ParseReader {
  private string: string;
  private position = 0;

  constructor(string: string) {
    this.string = string;
  }

  peek(): string | typeof EOL {
    const value = this.string[this.position];
    if (value === undefined) return EOL;

    return value;
  }

  read(): string | typeof EOL {
    const value = this.string[this.position];
    if (value === undefined) return EOL;
    this.position++;

    return value;
  }

  expect(char: string): boolean {
    if (this.peek() == char) {
      this.position++;
      return true;
    } else {
      return false;
    }
  }

  end(error?: Error): void {
    if (error) {
      const message = [error.message, "\n", this.string, "\n", ...Array(this.position).fill(" "), "^"];
      throw new Error(message.join(""), { cause: error });
    }
    if (this.position !== this.string.length) {
      const message = ["string remain", "\n", this.string, "\n", ...Array(this.position).fill(" "), "^"];
      throw new Error(message.join(""));
    }
  }
}
