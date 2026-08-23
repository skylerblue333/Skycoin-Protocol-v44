import assert from "node:assert/strict";
import test from "node:test";
import { transactionId, validateTransaction, type Transaction } from "./transaction";

const valid: Transaction = {
  version: 1,
  inputs: [{ owner: "owner-1", amount: 100n }],
  outputs: [{ address: "address-1", amount: 90n }],
};

test("accepts balanced transactions with change", () => {
  assert.doesNotThrow(() => validateTransaction(valid));
});

test("rejects outputs larger than inputs", () => {
  assert.throws(() => validateTransaction({ ...valid, outputs: [{ address: "address-1", amount: 101n }] }), /outputs_exceed_inputs/);
});

test("rejects zero-value inputs", () => {
  assert.throws(() => validateTransaction({ ...valid, inputs: [{ owner: "owner-1", amount: 0n }] }), /invalid_input/);
});

test("rejects missing owners and addresses", () => {
  assert.throws(() => validateTransaction({ ...valid, inputs: [{ owner: "", amount: 100n }] }), /invalid_input/);
  assert.throws(() => validateTransaction({ ...valid, outputs: [{ address: "", amount: 90n }] }), /invalid_output/);
});

test("produces a deterministic transaction id", () => {
  assert.equal(transactionId(valid), transactionId(structuredClone(valid)));
});
