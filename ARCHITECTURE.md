# Skycoin Protocol V44 — Architecture

## Scope

This repository is a protocol implementation boundary. The currently verified protocol primitive is transaction validation, canonical serialization, and deterministic transaction identification. It is **not** a complete consensus or network implementation.

## Transaction flow

```text
Client / Wallet
      |
      v
Transaction input
      |
      v
validateTransaction()
  |       |       |
  |       |       +--> output/input conservation
  |       +----------> positive values + required fields
  +------------------> version + non-empty collections
      |
      v
canonicalTransaction()
      |
      v
SHA-256 transactionId()
      |
      +------> Wallet / Finance / API integration
```

## Invariants currently enforced

1. Protocol version is a positive integer.
2. Transactions contain at least one input and output.
3. Input and output amounts are strictly positive `bigint` values.
4. Input owners and output addresses are required.
5. Total outputs cannot exceed total inputs.
6. The canonical representation converts `bigint` values to strings before hashing.

## Not yet implemented here

- consensus algorithm
- block validation
- signatures and key verification
- nonce/replay protection
- UTXO/state database
- peer-to-peer networking
- fork choice
- finality
- fee policy
- production chain deployment

Those capabilities must not be inferred from the existence of the transaction primitive.

## Consolidation strategy

Treat `protocol/transaction.ts` as a candidate shared contract/primitive. Before merging it into the canonical SKYCOIN4444 workspace, compare it against existing wallet, finance, ledger, and public upstream implementations. Preserve the strongest compatible implementation and avoid maintaining duplicate transaction engines.

## Verification

Run:

```bash
pnpm test -- protocol/transaction.test.ts
pnpm check
```

Full repository tests and production compatibility remain separate verification gates.
