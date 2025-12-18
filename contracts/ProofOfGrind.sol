// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title ProofOfGrind
 * @dev Free-mint NFT with grind tiers, streaks, and on-chain leaderboard
 * @notice Built for Celo Builder Rewards - maximize transactions & engagement
 */
contract ProofOfGrind is ERC721Enumerable, Ownable {
    using Strings for uint256;
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

    // Leaderboard
    address[] public topGrinders;
    mapping(address => bool) public isTopGrinder;
    uint256 public constant MAX_LEADERBOARD = 100;

    // ============ Events ============
    event NFTMinted(address indexed to, uint256 tokenId);
    event Grinded(address indexed grinder, uint256 totalGrinds, uint256 streak, uint256 points);
    event TierUp(address indexed grinder, uint256 newTier);
    event NewTopGrinder(address indexed grinder, uint256 rank);

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

    /**
     * @notice Record a grind session - generates transaction activity!
     * @dev Can be called once per hour, maintains streak if within 25h
     */
    function grind() external {
        require(balanceOf(msg.sender) > 0, "Mint first");

        GrinderStats storage stats = grinders[msg.sender];
        require(block.timestamp >= stats.lastGrindTime + GRIND_COOLDOWN, "Cooldown active");

        // Check streak
        if (stats.lastGrindTime > 0 && block.timestamp > stats.lastGrindTime + STREAK_WINDOW) {
            stats.currentStreak = 0; // Streak broken
        }

        stats.totalGrinds++;
        stats.currentStreak++;
        stats.lastGrindTime = block.timestamp;

        // Update best streak
        if (stats.currentStreak > stats.bestStreak) {
            stats.bestStreak = stats.currentStreak;
        }

        // Calculate points (streak multiplier)
        uint256 pointsEarned = 10 + (stats.currentStreak * 2);
        stats.points += pointsEarned;

        // Check tier upgrade
        uint256 newTier = _calculateTier(stats.totalGrinds);
        if (newTier > stats.tier) {
            stats.tier = newTier;
            emit TierUp(msg.sender, newTier);
        }

        // Update leaderboard
        _updateLeaderboard(msg.sender);

        emit Grinded(msg.sender, stats.totalGrinds, stats.currentStreak, stats.points);
    }

    /**
     * @notice Boost another grinder - social engagement!
     * @param grinder Address to boost
     */
    function boost(address grinder) external {
        require(grinder != msg.sender, "Cannot self-boost");
        require(balanceOf(grinder) > 0, "Target not a grinder");
        require(balanceOf(msg.sender) > 0, "Must be a grinder to boost");

        GrinderStats storage stats = grinders[grinder];
        stats.points += 5;

        // Booster also gets points
        grinders[msg.sender].points += 2;
    }

    /**
     * @notice Check in for daily bonus (separate from grind)
     */
    function dailyCheckIn() external {
        require(balanceOf(msg.sender) > 0, "Mint first");

        GrinderStats storage stats = grinders[msg.sender];

        // Simple daily check-in bonus
        stats.points += 25;

        emit Grinded(msg.sender, stats.totalGrinds, stats.currentStreak, stats.points);
    }

    // ============ Internal Functions ============

    function _calculateTier(uint256 totalGrinds) internal pure returns (uint256) {
        if (totalGrinds >= TIER_LEGEND) return TIER_LEGEND;
        if (totalGrinds >= TIER_DIAMOND) return TIER_DIAMOND;
        if (totalGrinds >= TIER_GOLD) return TIER_GOLD;
        if (totalGrinds >= TIER_SILVER) return TIER_SILVER;
        return TIER_BRONZE;
    }

    function _updateLeaderboard(address grinder) internal {
        // Simple insertion sort for leaderboard
        if (!isTopGrinder[grinder]) {
            if (topGrinders.length < MAX_LEADERBOARD) {
                topGrinders.push(grinder);
                isTopGrinder[grinder] = true;
            } else {
                // Check if grinder has more points than last place
                address lastPlace = topGrinders[topGrinders.length - 1];
                if (grinders[grinder].points > grinders[lastPlace].points) {
                    isTopGrinder[lastPlace] = false;
                    topGrinders[topGrinders.length - 1] = grinder;
                    isTopGrinder[grinder] = true;
                }
            }
        }

        // Bubble up if needed
        for (uint256 i = topGrinders.length; i > 1; i--) {
            if (grinders[topGrinders[i-1]].points > grinders[topGrinders[i-2]].points) {
                address temp = topGrinders[i-2];
                topGrinders[i-2] = topGrinders[i-1];
                topGrinders[i-1] = temp;
            } else {
                break;
            }
        }
    }
}
