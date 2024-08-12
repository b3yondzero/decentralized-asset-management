// SPDX-License-Identifier: MIT

pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./AssetMetadata.sol";
import "./OwnershipContract.sol";
import "./TransferConditions.sol";

interface IUserRoles {
    function hasRole(bytes32 role, address account) external view returns (bool);
    function ASSET_MANAGER_ROLE() external view returns (bytes32);
}

contract AssetRegistry is ERC721{

    uint256 public nextTokenId;
    
    IUserRoles public userRoles;
    AssetMetadata public assetMetadata;
    OwnershipContract public ownershipContract;
    TransferConditions public transferConditions;

    constructor(address _userRoles) ERC721("AssetRegistry", "ASSET") {
        userRoles = IUserRoles(_userRoles);
        assetMetadata = new AssetMetadata();
        ownershipContract =  new OwnershipContract();
        transferConditions = new TransferConditions();
    }

    modifier onlyAssetManager() {
        require(userRoles.hasRole(userRoles.ASSET_MANAGER_ROLE(), msg.sender), "Caller is not an asset manager");
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(_exists(tokenId), "ERC721: invalid token ID");
        _;
    }

    function registerAsset(address owner, string memory details, string memory transferCondition) public onlyAssetManager returns (uint) {
        uint tokenId = nextTokenId;
        _mint(owner, tokenId);
        
        assetMetadata.addMetadata(tokenId, details);
        ownershipContract.initializeOwner(tokenId, owner);
        transferConditions.setCondition(tokenId, transferCondition);
        nextTokenId++;
        return tokenId;
    }
    function getAssetDetails(uint tokenId) public view tokenExists(tokenId) returns (string memory) {
        return assetMetadata.getMetadata(tokenId);
    }

    function transferOwnership(uint tokenId, address newOwner) public tokenExists(tokenId) onlyAssetManager {
        ownershipContract.initiateTransfer(tokenId, newOwner);
    }
    function acceptOwnership(uint tokenId) public tokenExists(tokenId) onlyAssetManager {
        ownershipContract.approveTransfer(tokenId);
    }
    function getOwnership(uint tokenId) public view tokenExists(tokenId) returns (address) {
        return ownershipContract.getCurrentOwner(tokenId);
    }

    function setTransferCondition(uint256 tokenId, string memory condition)public onlyAssetManager tokenExists(tokenId) {
        transferConditions.setCondition(tokenId, condition);
    }

    function getTransferCondition(uint tokenId) public view tokenExists(tokenId) returns (string memory) {
        return transferConditions.getCondition(tokenId);
    }

}