import assert from "node:assert/strict";
import test from "node:test";
import { transactionId, validateTransaction, type Transaction } from "./transaction";

function nextRandom(seed: number): number {
  // Deterministic xorshift32: reproducible fuzz cases in CI.
  let x = seed | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x | 0;
}

function makeTransaction(seed: number): Transaction {
  const positive = BigInt((Math.abs(seed) % 10_000) + 1);
  const input = positive + BigInt(Math.abs(nextRandom(seed)) % 10_000);
  const output = BigInt(Math.abs(nextRandom(seed ^ 0x9e3779b9)) % Number(input)) + 1n;

  return {
    version: (Math.abs(seed) % 3) + 1,
    inputs: [{ owner: `owner-${seed}`, amount: input }],
    outputs: [{ address: `address-${seed}`, amount: output }],
  };
}

test("deterministic transaction fuzzing preserves validation and IDs", () => {
  const iterations = Number(process.env.FUZZ_ITERATIONS ?? 100_000);
  assert.ok(Number.isInteger(iterations) && iterations > 0 && iterations <= 5_000_000);

  for (let seed = 1; seed <= iterations; seed += 1) {
    const tx = makeTransaction(seed);
    assert.doesNotThrow(() => validateTransaction(tx));
    assert.equal(transactionId(tx), transactionId(structuredClone(tx)));
  }
});

test("fuzzed invalid transactions never bypass conservation validation", () => {
  const iterations = Math.min(Number(process.env.FUZZ_ITERATIONS ?? 100_000), 1_000_000);

  for (let seed = 1; seed <= iterations; seed += 1) {
    const tx = makeTransaction(seed);
    const input = tx.inputs[0];
    const invalid: Transaction = {
      ...tx,
      outputs: [{ address: `address-${seed}`, amount: input.amount + 1n }],
    };

    assert.throws(() => validateTransaction(invalid), /outputs_exceed_inputs/);
  }
});
