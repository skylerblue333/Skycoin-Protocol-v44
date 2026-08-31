// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IZKMLVerifierCore {
    function verifyProof(bytes calldata proof, uint256[] calldata publicInputs) external view returns (bool);
}

/// @notice Settlement boundary for agentic ecosystem actions.
/// @dev This is an integration boundary, not a claim of AP2 certification.
///      Mandates are domain-bound, chain-bound, nonce-protected and block-expiry-bound.
contract SkyEcosystemUltimateVault {
    uint256 private constant SECP256K1_HALF_N =
        0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0;

    address public immutable owner;
    address public immutable mandateSigner;
    IZKMLVerifierCore public immutable zkVerifier;

    mapping(bytes32 => bool) public executedMandates;
    mapping(address => uint256) public globalReputationXP;
    mapping(address => uint256) public pendingWithdrawals;
    bool public paused;

    event EcosystemSettled(
        bytes32 indexed mandateHash,
        address indexed executor,
        string moduleTag,
        address indexed recipient,
        uint256 amount
    );
    event Withdrawal(address indexed recipient, uint256 amount);
    event Paused(bool value);

    error Unauthorized();
    error ContractPaused();
    error InvalidAmount();
    error InvalidDeadline();
    error InvalidRecipient();
    error MandateAlreadyExecuted();
    error InvalidMandateSignature();
    error InvalidZKMLProof();
    error NothingToWithdraw();

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
        uint256 deadlineBlock,
        string calldata moduleTag,
        address recipient,
        uint256 amount
    ) external payable {
        if (paused) revert ContractPaused();
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount == 0 || msg.value != amount) revert InvalidAmount();
        if (block.number > deadlineBlock) revert InvalidDeadline();

        bytes32 proofHash = keccak256(zkmlProof);
        bytes32 mandateHash = keccak256(
            abi.encode(
                address(this),
                block.chainid,
                mandateNonce,
                deadlineBlock,
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

        // Effects are committed before any later recipient withdrawal. Settlement funds
        // use a pull-payment boundary so an arbitrary recipient cannot reenter this action.
        executedMandates[mandateHash] = true;
        globalReputationXP[msg.sender] += 50;
        pendingWithdrawals[recipient] += amount;

        emit EcosystemSettled(mandateHash, msg.sender, moduleTag, recipient, amount);
    }

    /// @notice Withdraw caller-owned settled funds.
    /// @dev State is cleared before transfer (checks-effects-interactions).
    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        pendingWithdrawals[msg.sender] = 0;
        emit Withdrawal(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }

    function _recover(bytes32 digest, bytes calldata signature) internal pure returns (address) {
        if (signature.length != 65) return address(0);

        bytes32 r = bytes32(signature[0:32]);
        bytes32 s = bytes32(signature[32:64]);
        uint8 v = uint8(signature[64]);

        if (v < 27) v += 27;
        if (v != 27 && v != 28) return address(0);
        // Reject the upper half of secp256k1 to prevent ECDSA signature malleability.
        if (uint256(s) > SECP256K1_HALF_N) return address(0);

        return ecrecover(digest, v, r, s);
    }

    receive() external payable {}
}
