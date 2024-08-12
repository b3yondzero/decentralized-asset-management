// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

interface IUserRoles {
    function hasRole(bytes32 role, address account) external view returns (bool);
    function MAINTENANCE_STAFF_ROLE() external view returns (bytes32);
}

interface IAssetRegistry {
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract Workorder{
    IUserRoles public userRoles;
    IAssetRegistry public assetRegistry;
    struct WorkOrder {
        string details;
        bool isCreated;
        bool isCompleted;
    }

    mapping(uint256 => WorkOrder[]) private workOrders;

    event WorkOrderCreated(uint256 indexed tokenId, string details);
    event WorkOrderUpdated(uint256 indexed tokenId, uint256 index, string newDetails, bool isCompleted);

    constructor(address _userRoles, address _assetRegistry) {
        userRoles = IUserRoles(_userRoles);
        assetRegistry = IAssetRegistry(_assetRegistry);
    }

    modifier onlyMaintenanceStaff() {
        require(userRoles.hasRole(userRoles.MAINTENANCE_STAFF_ROLE(), msg.sender), "Caller is not maintenance staff");
        _;
    }

    modifier assetExists(uint256 tokenId) {
        require(assetRegistry.ownerOf(tokenId) != address(0), "Asset does not exist");
        _;
    }

    function createWorkOrder(uint256 tokenId, string memory details) public onlyMaintenanceStaff assetExists(tokenId) {
        workOrders[tokenId].push(WorkOrder(details, true, false));
        emit WorkOrderCreated(tokenId, details);
    }

    function updateWorkOrder(uint256 tokenId, uint256 index, string memory newDetails, bool isCompleted) public onlyMaintenanceStaff assetExists(tokenId) {
        require(index < workOrders[tokenId].length, "Invalid index");
        workOrders[tokenId][index].details = newDetails;
        workOrders[tokenId][index].isCompleted = isCompleted;
        emit WorkOrderUpdated(tokenId, index, newDetails, isCompleted);
    }

    function getWorkOrders(uint256 tokenId) public view assetExists(tokenId) returns (WorkOrder[] memory) {
        return workOrders[tokenId];
    }
}
