// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProofOfGrind
 * @dev Free-mint NFT with grind tiers, streaks, and on-chain leaderboard
 * @notice Built for Celo Builder Rewards - maximize transactions & engagement
 */
contract ProofOfGrind is ERC721Enumerable, Ownable {
    // ============ Structs ============
    struct GrinderStats {
        uint256 totalGrinds;
        uint256 currentStreak;
        uint256 bestStreak;
        uint256 lastGrindTime;
        uint256 tier;
        uint256 points;
    }

    // ============ State Variables ============
    uint256 private _tokenIdCounter;
    uint256 public constant GRIND_COOLDOWN = 1 hours;
    uint256 public constant STREAK_WINDOW = 25 hours;

    // Tier thresholds
    uint256 public constant TIER_BRONZE = 0;
    uint256 public constant TIER_SILVER = 10;
    uint256 public constant TIER_GOLD = 50;
    uint256 public constant TIER_DIAMOND = 100;
    uint256 public constant TIER_LEGEND = 500;

    mapping(uint256 => address) public tokenToGrinder;
    mapping(address => GrinderStats) public grinders;

    // ============ Events ============
    event NFTMinted(address indexed to, uint256 tokenId);

    // ============ Constructor ============
    constructor() ERC721("Proof of Grind", "GRIND") Ownable(msg.sender) {}

    // ============ Core Functions ============

    /**
     * @notice Free mint your Proof of Grind NFT
     * @dev One NFT per address, starts your grind journey
     */
    function mint() external {
        require(balanceOf(msg.sender) == 0, "Already minted");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(msg.sender, tokenId);
        tokenToGrinder[tokenId] = msg.sender;

        // Initialize grinder stats
        grinders[msg.sender] = GrinderStats({
            totalGrinds: 0,
            currentStreak: 0,
            bestStreak: 0,
            lastGrindTime: 0,
            tier: 0,
            points: 0
        });

        emit NFTMinted(msg.sender, tokenId);
    }
}
