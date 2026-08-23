# Skycoin Protocol V44

Protocol-focused implementation boundary for the SKYCOIN4444 ecosystem.

## Verified implementation

The repository contains a substantial TypeScript/React source tree plus SQL, Rust, Python, and supporting configuration. The protocol foundation under `protocol/` is the evidence-backed part of this repository:

- typed transaction inputs and outputs;
- positive-value and required-field validation;
- output/input conservation enforcement;
- canonical serialization of `bigint` values;
- deterministic SHA-256 transaction identifiers;
- binary Merkle roots and proofs;
- deterministic fuzz tests with bounded CI iterations.

This is an **ecosystem transaction primitive**, not a claim that it implements the complete Skycoin V44 consensus/network protocol.

## Verification pipeline

GitHub Actions now performs:

1. frozen `pnpm` dependency installation;
2. TypeScript type checking;
3. protocol/unit/fuzz tests;
4. production build;
5. high-severity dependency audit.

## Strongest-source strategy

The canonical implementation should absorb verified behavior from this repository and compare it with mature public reference implementations before promoting consensus-critical behavior. External source must be compatibility- and license-reviewed before adoption, with attribution preserved where required.

## Institutional value surfaces

Potential product and revenue surfaces around this protocol foundation include:

1. protocol SDK licensing/support;
2. wallet and custody integrations;
3. transaction validation APIs;
4. blockchain indexing services;
5. testnet/node infrastructure;
6. enterprise chain adapters;
7. developer tooling and SDK generation;
8. compliance/audit tooling;
9. observability and protocol analytics;
10. security review and hardening services;
11. protocol engineering, migration, and long-term support contracts.

These are potential business models, not claims of current revenue, valuation, customers, or production adoption.

## Status

- Transaction validation primitive: **implemented**
- Deterministic transaction ID: **implemented**
- Merkle root/proof primitive: **implemented**
- Deterministic fuzz tests: **implemented**
- Automated CI verification: **implemented**
- Full protocol/consensus compatibility: **not claimed**
- Production network readiness: **not claimed**
- Independent security review: **pending**

## Consolidation target

**SKYCOIN4444 → Protocol → transaction validation / serialization → Wallet / Finance / API / Realtime boundaries**

The goal is to turn focused repositories into useful domain components and merge the strongest verified implementations rather than maintain duplicate protocol engines.
