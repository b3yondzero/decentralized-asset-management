// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract UserRoles is AccessControl {
    bytes32 public constant ASSET_MANAGER_ROLE = keccak256("ASSET_MANAGER_ROLE");
    bytes32 public constant MAINTENANCE_STAFF_ROLE = keccak256("MAINTENANCE_STAFF_ROLE");

    constructor(){
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); 
    }

    modifier adminMode(){
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }

    function grantAssetManagerRole(address account) public adminMode {
        grantRole(ASSET_MANAGER_ROLE, account);
    }

    function grantMaintenanceStaffRole(address account) public adminMode  {
        grantRole(MAINTENANCE_STAFF_ROLE, account);
    }

    function revokeAssetManagerRole(address account) public adminMode {
        revokeRole(ASSET_MANAGER_ROLE, account);
    }

    function revokeMaintenanceStaffRole(address account) public adminMode {
        revokeRole(MAINTENANCE_STAFF_ROLE, account);
    }


    function hasAssetManagerRole(address account) public view returns (bool) {
        return hasRole(ASSET_MANAGER_ROLE, account);
    }

    function hasMaintenanceStaffRole(address account) public view returns (bool) {
        return hasRole(MAINTENANCE_STAFF_ROLE, account);
    }

    
}
