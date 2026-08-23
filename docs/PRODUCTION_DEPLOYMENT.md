# SKYCOIN4444 Production Deployment Gate

## Current evidence boundary

The repository is a TypeScript/Vite/Node application with protocol tests and an existing CI pipeline. The repository does **not** currently contain the `Dockerfile.go.prod`, `Dockerfile.frontend.prod`, `Dockerfile.zkml.prod`, or `main.go` assumed by the proposed unified Docker/Go deployment blueprint.

Therefore the deployment blueprint is treated as an architecture target, not as an already-runnable production deployment.

## Required promotion sequence

1. **Application verification**
   - `pnpm install --frozen-lockfile`
   - `pnpm check`
   - `pnpm test`
   - `pnpm build`
   - `pnpm audit --audit-level high`

2. **Protocol discovery verification**
   - `node scripts/validate-ucp.mjs`
   - Verify `/.well-known/ucp` is served from the real production hostname.
   - Replace any staging-only endpoint with the actual deployed API gateway before go-live.

3. **Solidity verification**
   - `forge build --sizes`
   - `forge test -vvv`
   - `slither contracts --exclude-dependencies`
   - Review every high/medium finding before authorizing funds movement.

4. **Agent protocol integration**
   - UCP discovery and checkout contract tests;
   - MCP tool authorization tests;
   - A2A authentication, replay, timeout and cancellation tests;
   - AP2 mandate signature, nonce and expiry tests;
   - ZKML verifier positive/negative proof tests.

5. **Infrastructure**
   - provision the real Go/A2A service only after its source and Dockerfile are committed;
   - private Redis/NATS network only;
   - TLS termination and authenticated service-to-service transport;
   - secrets supplied through the deployment platform, never committed to Git;
   - observability and alerting enabled before external traffic.

6. **Deployment authorization**
   - merge only after required CI checks pass;
   - deploy the exact reviewed commit SHA;
   - run authenticated smoke tests;
   - record deployment SHA, verifier address, mandate signer address, chain ID and rollback target.

## Security boundary

`SkyEcosystemUltimateVault.sol` intentionally does not claim AP2 certification. The contract requires a domain/chain-bound signed mandate, a nonce, an expiry, exact `msg.value`, and a ZKML verifier result before settlement. The verifier implementation and mandate signer remain external trust boundaries and require independent review.

## Open-source adoption policy

Use upstream projects as version-pinned dependencies or clearly isolated reference implementations. Review compatibility and licenses before adoption. Do not copy protocol-critical code merely because a repository is popular; require tests and interface-level evidence.

## Promotion rule

**Code integrated → GitHub verified → CI/security gate passed → external review completed → deployment approved → runtime smoke evidence recorded.**

Until those steps are evidenced, the correct status is **deployment pending**, not production-ready.
