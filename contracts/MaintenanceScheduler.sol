// SPDX-License-Identifier: MIT

pragma solidity >=0.8.2 <0.9.0;

interface IUserRoles {
    function hasRole(bytes32 role, address account) external view returns (bool);
    function ASSET_MANAGER_ROLE() external view returns (bytes32);
}

interface IAssetRegistry {
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract MaintenanceScheduler {

    IUserRoles public userRoles;
    IAssetRegistry public assetRegistry;

    constructor(address _userRoles, address _assetRegistry) {
        userRoles = IUserRoles(_userRoles);
        assetRegistry = IAssetRegistry(_assetRegistry);
    }

    modifier onlyAssetManager() {
        require(userRoles.hasRole(userRoles.ASSET_MANAGER_ROLE(), msg.sender), "Caller is not an asset manager");
        _;
    }

    modifier assetExists(uint256 tokenId) {
        require(assetRegistry.ownerOf(tokenId) != address(0), "Asset does not exist");
        _;
    }

    struct Maintenance {
        string details;
        bool isScheduled;
    }

    mapping(uint256 => Maintenance[]) private maintenanceSchedules;

    event MaintenanceScheduled(uint256 indexed tokenId, string details);
    event MaintenanceUpdated(uint256 indexed tokenId, uint256 index, string newDetails);
    event MaintenanceStatusUpdated(uint256 indexed tokenId, uint256 index, bool isScheduled);

    function scheduleMaintenance(uint256 tokenId, string memory details) public onlyAssetManager assetExists(tokenId){
        maintenanceSchedules[tokenId].push(Maintenance(details, true));
        emit MaintenanceScheduled(tokenId, details);
    }

    function updateMaintenance(uint256 tokenId, uint256 index, string memory newDetails) public onlyAssetManager assetExists(tokenId){
        require(index < maintenanceSchedules[tokenId].length, "Invalid index");
        maintenanceSchedules[tokenId][index].details = newDetails;
        emit MaintenanceUpdated(tokenId, index, newDetails);
    }

    function updateMaintenanceStatus(uint256 tokenId, uint256 index, bool isScheduled) public onlyAssetManager assetExists(tokenId) {
        require(index < maintenanceSchedules[tokenId].length, "Invalid index");
        maintenanceSchedules[tokenId][index].isScheduled = isScheduled;
        emit MaintenanceStatusUpdated(tokenId, index, isScheduled);
    }

    function getMaintenanceSchedule(uint256 tokenId) public view assetExists(tokenId) returns (Maintenance[] memory) {
        return maintenanceSchedules[tokenId];
    }
}
