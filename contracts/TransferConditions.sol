// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TransferConditions is Ownable {
    mapping(uint256 => string) private conditions;

    event ConditionSet(uint256 indexed tokenId, string condition);

    function setCondition(uint256 tokenId, string memory condition) public onlyOwner {
        conditions[tokenId] = condition;
        emit ConditionSet(tokenId, condition);
    }

    function getCondition(uint256 tokenId) public view returns (string memory) {
        return conditions[tokenId];
    }
}
