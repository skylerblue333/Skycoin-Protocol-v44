// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../contracts/SkyEcosystemUltimateVault.sol";

contract MockZKMLVerifierCore is IZKMLVerifierCore {
    bool private result = true;

    function setResult(bool value) external {
        result = value;
    }

    function verifyProof(bytes calldata, uint256[] calldata) external view returns (bool) {
        return result;
    }
}

contract SkyEcosystemUltimateVaultTest {
    MockZKMLVerifierCore private verifier;
    SkyEcosystemUltimateVault private vault;

    function setUp() public {
        verifier = new MockZKMLVerifierCore();
        vault = new SkyEcosystemUltimateVault(address(this), address(verifier));
    }

    function testConstructorBindsOwnerSignerAndVerifier() public view {
        require(vault.owner() == address(this), "owner mismatch");
        require(vault.mandateSigner() == address(this), "signer mismatch");
        require(address(vault.zkVerifier()) == address(verifier), "verifier mismatch");
    }

    function testOwnerCanPauseAndUnpause() public {
        vault.setPaused(true);
        require(vault.paused(), "pause did not persist");
        vault.setPaused(false);
        require(!vault.paused(), "unpause did not persist");
    }

    function testPausedVaultRejectsExecutionBeforeExternalVerification() public {
        vault.setPaused(true);
        uint256[] memory inputs = new uint256[](0);
        (bool ok, ) = address(vault).call(
            abi.encodeCall(
                vault.executeUniversalAgenticAction,
                (bytes(""), bytes(""), inputs, 1, block.number + 1, "test", address(this), 1)
            )
        );
        require(!ok, "paused execution unexpectedly succeeded");
    }

    function testZeroRecipientIsRejected() public {
        uint256[] memory inputs = new uint256[](0);
        (bool ok, ) = address(vault).call(
            abi.encodeCall(
                vault.executeUniversalAgenticAction,
                (bytes(""), bytes(""), inputs, 2, block.number + 1, "test", address(0), 0)
            )
        );
        require(!ok, "zero recipient unexpectedly accepted");
    }

    function testEmptyWithdrawalIsRejected() public {
        (bool ok, ) = address(vault).call(abi.encodeCall(vault.withdraw, ()));
        require(!ok, "empty withdrawal unexpectedly succeeded");
    }

    function testConstructorRejectsZeroSigner() public {
        bool reverted;
        try new SkyEcosystemUltimateVault(address(0), address(verifier)) returns (
            SkyEcosystemUltimateVault
        ) {
            reverted = false;
        } catch {
            reverted = true;
        }
        require(reverted, "zero signer unexpectedly accepted");
    }

    function testConstructorRejectsZeroVerifier() public {
        bool reverted;
        try new SkyEcosystemUltimateVault(address(this), address(0)) returns (
            SkyEcosystemUltimateVault
        ) {
            reverted = false;
        } catch {
            reverted = true;
        }
        require(reverted, "zero verifier unexpectedly accepted");
    }
}
