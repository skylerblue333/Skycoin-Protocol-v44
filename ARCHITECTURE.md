# Skycoin Protocol V44 — Architecture

## Verification-first boundary

This repository separates the currently verified transaction primitives from the larger SkyCoin ecosystem. The executable protocol layer currently provides transaction validation, deterministic canonical serialization, SHA-256 transaction IDs, binary Merkle roots/proofs, deterministic fuzzing, and CI verification.

It does **not** claim to be a complete consensus or production mainnet implementation.

## Transaction path

```text
wallet / API command
        |
        v
Transaction object
        |
        v
validateTransaction()
  |             |
 invalid       valid
  |             |
 reject         v
          canonicalTransaction()
                |
                v
           SHA-256 ID
                |
                v
          Merkle aggregation
                |
                v
     protocol/network boundary
```

## State invariants

1. Protocol version is a positive integer.
2. Transactions contain at least one input and output.
3. Every input and output amount is strictly positive.
4. Input owners and output addresses are required.
5. Total outputs cannot exceed total inputs.
6. Canonical serialization converts `bigint` amounts to decimal strings deterministically.
7. Transaction IDs are SHA-256 hashes of canonical serialization.
8. Merkle leaves must be valid 64-character hexadecimal transaction IDs.

## Deterministic fuzzing

`protocol/transaction.fuzz.test.ts` uses a deterministic xorshift32 generator so failures can be reproduced from the same seed. CI runs 100,000 generated cases by default and supports bounded larger runs through `FUZZ_ITERATIONS`.

## Institutional value surfaces

Potential product surfaces include protocol SDKs, wallet integrations, transaction validation services, indexers, audit tooling, developer APIs, testnet infrastructure, enterprise blockchain adapters, observability services, security assessments, and protocol engineering/support contracts. These are opportunities, not claims of current revenue or adoption.

## Strongest-source policy

When incorporating external open-source infrastructure, prefer mature, actively maintained implementations and preserve license/attribution requirements. Consensus-critical behavior must be compatibility-tested and independently reviewed before promotion into a production network.

## Remaining protocol gates

Consensus, block validation, signatures, nonce/replay protection, persistent UTXO/state storage, peer-to-peer networking, fork choice, finality, fee policy, and production chain deployment remain separate engineering gates. They must not be inferred from the verified transaction layer.

## Verification

GitHub Actions now runs a frozen pnpm install, TypeScript check, 100,000-iteration protocol fuzz/test suite, production build, and high-severity dependency audit.
