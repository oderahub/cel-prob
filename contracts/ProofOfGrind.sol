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
    // ============ State Variables ============
    uint256 private _tokenIdCounter;

    mapping(uint256 => address) public tokenToGrinder;

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

        emit NFTMinted(msg.sender, tokenId);
    }
}
