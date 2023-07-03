import { expect, test } from "vitest";

import { json } from "./json";
import { generatePR } from "./reader";

test('parse "null"', () => {
	const pr = generatePR("null");
	expect(json(pr)).toBeNull();
});
