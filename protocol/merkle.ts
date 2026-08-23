import { createHash } from "node:crypto";

function hashHex(value: string): string {
  return createHash("sha256").update(Buffer.from(value, "hex")).digest("hex");
}

/**
 * Computes a Bitcoin-style binary Merkle root over transaction IDs.
 * Leaves are duplicated when a level has an odd cardinality.
 */
export function merkleRoot(transactionIds: readonly string[]): string {
  if (transactionIds.length === 0) return "";
  if (transactionIds.some((id) => !/^[0-9a-f]{64}$/i.test(id))) {
    throw new Error("invalid_transaction_id");
  }

  let level = transactionIds.map((id) => id.toLowerCase());
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? left;
      next.push(hashHex(left + right));
    }
    level = next;
  }
  return level[0];
}

export function merkleProof(transactionIds: readonly string[], index: number): string[] {
  if (index < 0 || index >= transactionIds.length) throw new Error("invalid_index");
  if (transactionIds.some((id) => !/^[0-9a-f]{64}$/i.test(id))) throw new Error("invalid_transaction_id");

  const proof: string[] = [];
  let level = transactionIds.map((id) => id.toLowerCase());
  let position = index;
  while (level.length > 1) {
    const sibling = position % 2 === 0 ? position + 1 : position - 1;
    proof.push(level[sibling] ?? level[position]);
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(hashHex(level[i] + (level[i + 1] ?? level[i])));
    }
    position = Math.floor(position / 2);
    level = next;
  }
  return proof;
}
