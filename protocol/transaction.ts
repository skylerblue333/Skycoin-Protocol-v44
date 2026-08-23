import { createHash } from "node:crypto";

export type TransactionInput = { owner: string; amount: bigint };
export type TransactionOutput = { address: string; amount: bigint };
export type Transaction = { version: number; inputs: TransactionInput[]; outputs: TransactionOutput[]; memo?: string };

export function validateTransaction(tx: Transaction): void {
  if (!Number.isInteger(tx.version) || tx.version < 1) throw new Error("invalid_version");
  if (tx.inputs.length === 0) throw new Error("missing_inputs");
  if (tx.outputs.length === 0) throw new Error("missing_outputs");
  if (tx.inputs.some((i) => i.amount <= 0n || !i.owner)) throw new Error("invalid_input");
  if (tx.outputs.some((o) => o.amount <= 0n || !o.address)) throw new Error("invalid_output");
  const inputTotal = tx.inputs.reduce((sum, input) => sum + input.amount, 0n);
  const outputTotal = tx.outputs.reduce((sum, output) => sum + output.amount, 0n);
  if (outputTotal > inputTotal) throw new Error("outputs_exceed_inputs");
}

export function canonicalTransaction(tx: Transaction): string {
  validateTransaction(tx);
  return JSON.stringify({
    version: tx.version,
    inputs: tx.inputs.map((i) => ({ owner: i.owner, amount: i.amount.toString() })),
    outputs: tx.outputs.map((o) => ({ address: o.address, amount: o.amount.toString() })),
    ...(tx.memo === undefined ? {} : { memo: tx.memo }),
  });
}

export function transactionId(tx: Transaction): string {
  return createHash("sha256").update(canonicalTransaction(tx)).digest("hex");
}
