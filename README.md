# Skycoin Protocol V44

Protocol-focused implementation boundary for the SKYCOIN4444 ecosystem.

## Verified implementation

The repository contains a TypeScript/React application plus SQL and supporting protocol/configuration code. The protocol foundation under `protocol/` is the evidence-backed transaction layer:

- typed transaction inputs and outputs;
- positive-value and required-field validation;
- output/input conservation enforcement;
- canonical serialization of `bigint` values;
- deterministic SHA-256 transaction identifiers;
- binary Merkle roots and proofs;
- deterministic fuzz tests with bounded CI iterations.

This is an **ecosystem transaction primitive**, not a claim that it implements the complete Skycoin V44 consensus/network protocol.

## Max production gate

The `max-production-gate-20260823` branch adds the next verification boundary without claiming deployment before evidence exists:

- `/.well-known/ucp` machine-discovery manifest for SkyShop/SkyGaming/SkySchool/identity service boundaries;
- `contracts/SkyEcosystemUltimateVault.sol` with domain-bound, chain-bound, nonce-protected, expiry-bound signed mandates and ZKML verifier hooks;
- `foundry.toml` for deterministic Solidity compilation;
- `scripts/validate-ucp.mjs` for manifest validation;
- `.github/workflows/production-gate.yml` for TypeScript checks, protocol/integration tests, production build, dependency audit, Solidity compile/test, and Slither static analysis.

The vault is an integration boundary, **not a claim of AP2 certification or an independent security audit**. A real deployment still requires a configured verifier, authorized mandate signer, reviewed protocol mappings, secrets, infrastructure, and external security review.

## Open-source integration strategy

Use mature upstream projects as reviewed dependencies rather than copying unverified code into consensus-critical paths. Candidate reference layers include:

- Universal Commerce Protocol: `Universal-Commerce-Protocol/ucp`;
- zero-knowledge proving: `risc0/risc0`;
- WebSocket transport: `gorilla/websocket`;
- observability: `open-telemetry/opentelemetry-go`;
- Three.js for browser 3D rendering where the gaming client requires it.

Each adoption must be license-reviewed, version-pinned, tested against the local interfaces, and kept behind explicit integration boundaries.

## Verification pipeline

GitHub Actions performs the application gate:

1. frozen `pnpm` dependency installation;
2. TypeScript type checking;
3. protocol/unit/fuzz tests;
4. production build;
5. high-severity dependency audit.

The max production gate additionally validates the UCP manifest and runs Solidity compilation/tests plus Slither static analysis.

## Status

- Transaction validation primitive: **implemented**
- Deterministic transaction ID: **implemented**
- Merkle root/proof primitive: **implemented**
- Deterministic fuzz tests: **implemented**
- Automated application CI: **implemented**
- Max production verification workflow: **configured; CI result pending**
- UCP manifest: **committed on max-production-gate-20260823**
- Signed mandate/ZKML vault boundary: **committed; security review pending**
- Full protocol/consensus compatibility: **not claimed**
- Production network deployment: **pending infrastructure and passing CI/security evidence**
- Independent security review: **pending**

## Consolidation target

**SKYCOIN4444 → Protocol → transaction validation / serialization → Wallet / Finance / API / Realtime → UCP / MCP / A2A integration boundaries**

The goal is to turn focused repositories into useful domain components and merge the strongest verified implementations rather than maintain duplicate protocol engines.
