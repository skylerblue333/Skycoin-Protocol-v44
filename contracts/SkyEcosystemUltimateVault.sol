// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IZKMLVerifierCore {
    function verifyProof(bytes calldata proof, uint256[] calldata publicInputs) external view returns (bool);
}

/// @notice Settlement boundary for agentic ecosystem actions.
/// @dev This is an integration boundary, not a claim of AP2 certification.
///      Mandates are domain-bound, chain-bound, nonce-protected and expiry-bound.
contract SkyEcosystemUltimateVault {
    address public immutable owner;
    address public immutable mandateSigner;
    IZKMLVerifierCore public immutable zkVerifier;

    mapping(bytes32 => bool) public executedMandates;
    mapping(address => uint256) public globalReputationXP;
    bool public paused;

    event EcosystemSettled(
        bytes32 indexed mandateHash,
        address indexed executor,
        string moduleTag,
        address indexed recipient,
        uint256 amount
    );
    event Paused(bool value);

    error Unauthorized();
    error ContractPaused();
    error InvalidAmount();
    error InvalidDeadline();
    error MandateAlreadyExecuted();
    error InvalidMandateSignature();
    error InvalidZKMLProof();
    error SettlementFailed();

    constructor(address _mandateSigner, address _zkVerifier) {
        if (_mandateSigner == address(0) || _zkVerifier == address(0)) revert Unauthorized();
        owner = msg.sender;
        mandateSigner = _mandateSigner;
        zkVerifier = IZKMLVerifierCore(_zkVerifier);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    function setPaused(bool value) external onlyOwner {
        paused = value;
        emit Paused(value);
    }

    function executeUniversalAgenticAction(
        bytes calldata ap2IntentMandate,
        bytes calldata zkmlProof,
        uint256[] calldata publicInputs,
        uint256 mandateNonce,
        uint256 deadline,
        string calldata moduleTag,
        address payable recipient,
        uint256 amount
    ) external payable {
        if (paused) revert ContractPaused();
        if (amount == 0 || msg.value != amount) revert InvalidAmount();
        if (block.timestamp > deadline) revert InvalidDeadline();

        bytes32 proofHash = keccak256(zkmlProof);
        bytes32 mandateHash = keccak256(
            abi.encode(
                address(this),
                block.chainid,
                mandateNonce,
                deadline,
                keccak256(bytes(moduleTag)),
                recipient,
                amount,
                proofHash
            )
        );

        if (executedMandates[mandateHash]) revert MandateAlreadyExecuted();

        bytes32 signedDigest = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", mandateHash)
        );
        if (_recover(signedDigest, ap2IntentMandate) != mandateSigner) {
            revert InvalidMandateSignature();
        }

        if (!zkVerifier.verifyProof(zkmlProof, publicInputs)) {
            revert InvalidZKMLProof();
        }

        executedMandates[mandateHash] = true;
        globalReputationXP[msg.sender] += 50;

        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert SettlementFailed();

        emit EcosystemSettled(mandateHash, msg.sender, moduleTag, recipient, amount);
    }

    function _recover(bytes32 digest, bytes calldata signature) internal pure returns (address) {
        if (signature.length != 65) return address(0);

        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }

        if (v < 27) v += 27;
        if (v != 27 && v != 28) return address(0);
        return ecrecover(digest, v, r, s);
    }

    receive() external payable {}
}
