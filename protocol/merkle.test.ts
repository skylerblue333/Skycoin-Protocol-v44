import { describe, expect, it } from "vitest";
import { merkleProof, merkleRoot } from "./merkle";

const ids = [
  "00".repeat(32),
  "11".repeat(32),
  "22".repeat(32),
  "33".repeat(32),
];

describe("Merkle tree", () => {
  it("produces a deterministic root", () => {
    expect(merkleRoot(ids)).toBe(merkleRoot([...ids]));
    expect(merkleRoot(ids)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("changes when a transaction changes", () => {
    expect(merkleRoot(ids)).not.toBe(merkleRoot([ids[0], ids[1], ids[2], "44".repeat(32)]));
  });

  it("returns a proof path for a transaction", () => {
    const proof = merkleProof(ids, 2);
    expect(proof).toHaveLength(2);
    expect(proof.every((item) => /^[0-9a-f]{64}$/.test(item))).toBe(true);
  });

  it("rejects malformed transaction IDs", () => {
    expect(() => merkleRoot(["bad"])).toThrow("invalid_transaction_id");
    expect(() => merkleProof(ids, 99)).toThrow("invalid_index");
  });
});
