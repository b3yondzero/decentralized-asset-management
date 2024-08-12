// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnershipContract is Ownable {
    mapping(uint256 => address) private currentOwner;
    mapping(uint256 => address) private pendingOwner;

    event OwnershipTransferred(uint256 indexed tokenId, address indexed oldOwner, address indexed newOwner);

    function initializeOwner(uint256 tokenId, address owner) public onlyOwner {
        require(currentOwner[tokenId] == address(0), "Owner already initialized");
        currentOwner[tokenId] = owner;
    }

    function initiateTransfer(uint256 tokenId, address newOwner) public {
        require(tx.origin == currentOwner[tokenId], "Only current owner can initiate transfer");
        pendingOwner[tokenId] = newOwner;
    }

    function approveTransfer(uint256 tokenId) public {
        require(tx.origin == pendingOwner[tokenId], "Only pending owner can approve transfer");
        address oldOwner = currentOwner[tokenId];
        currentOwner[tokenId] = pendingOwner[tokenId];
        pendingOwner[tokenId] = address(0);
        emit OwnershipTransferred(tokenId, oldOwner, currentOwner[tokenId]);
    }
    
    function getCurrentOwner(uint256 tokenId) public view returns (address) {
        return currentOwner[tokenId];
    }

    function getPendingOwner(uint256 tokenId) public view returns (address) {
        return pendingOwner[tokenId];
    }
}
