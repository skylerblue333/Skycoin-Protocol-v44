# Skycoin Protocol V44

Protocol-focused implementation boundary for the SKYCOIN4444 ecosystem.

## Current audit

The repository contains a substantial TypeScript/React source tree (162 TypeScript files and 101 TSX files in the current audit), SQL, Rust, Python, and supporting configuration, with 312 tracked files observed. Tests are present, but repository inspection alone does not prove that the full suite passes.

## New protocol foundation

This pass adds a focused transaction-domain layer under `protocol/`:

- typed transaction inputs and outputs
- positive-value and required-field validation
- conservation check preventing outputs from exceeding inputs
- canonical serialization of transaction values
- deterministic SHA-256 transaction identifier
- automated tests for valid transactions, invalid totals, and deterministic IDs

This is an **ecosystem transaction primitive**, not a claim that it implements the complete Skycoin V44 consensus/network protocol.

## Strongest-source strategy

The canonical implementation will absorb verified protocol behavior from this repository and compare it with the public Skycoin reference implementation before promoting consensus-critical behavior. The upstream project contains mature transaction, wallet, API, and history-db implementations; these are reference material and must be compatibility- and license-reviewed before adoption.

For third-party adoption, preserve license/attribution requirements, isolate adapters, and test compatibility before integration.

## Status

- Transaction validation primitive: **implemented**
- Deterministic transaction ID: **implemented**
- Unit tests: **implemented**
- Full protocol/consensus compatibility: **not claimed**
- Production network readiness: **not claimed**
- Independent security review: **pending**

## Consolidation target

**SKYCOIN4444 → Protocol → transaction validation / serialization → Wallet / Finance / API / Realtime boundaries**

The goal is to turn focused repositories into useful domain components, then merge the strongest verified implementations rather than maintain duplicate protocol engines.

## License

MIT, subject to the checked-in license and any third-party dependencies or source adopted during future consolidation.
