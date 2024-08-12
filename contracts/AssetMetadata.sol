// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AssetMetadata is Ownable {
    mapping(uint256 => string) private metadata;

    function addMetadata(uint256 tokenId, string memory data) public onlyOwner {
        metadata[tokenId] = data;
    }

    function getMetadata(uint256 tokenId) public view returns (string memory) {
        return metadata[tokenId];
    }
}
