const AssetRegistry = artifacts.require("AssetRegistry");
const MaintenanceScheduler = artifacts.require("MaintenanceScheduler");
const Workorder = artifacts.require("Workorder");
const UserRoles = artifacts.require("UserRoles");

module.exports = async function (deployer) {

  // Deploy UserRoles first as it is a dependency for AssetRegistry, MaintenanceScheduler and Workorder
  await deployer.deploy(UserRoles);
  const userRoles = await UserRoles.deployed();

  /* 
  Deploy AssetRegistry 
  AssetRegistry will deploy three more contracts 
  AssetMetadata, OwnershipContract and TransferConditions
  with the required dependencies
  */
  await deployer.deploy(AssetRegistry,userRoles.address);

  const assetRegistry= await AssetRegistry.deployed();
  
  // Deploy MaintenanceScheduler and Workorder with the required dependencies
  await deployer.deploy(MaintenanceScheduler, assetRegistry.address, userRoles.address);
  await deployer.deploy(Workorder, assetRegistry.address, userRoles.address);

  const maintenanceScheduler= await MaintenanceScheduler.deployed();
  const workOrderContract= await Workorder.deployed();

  console.log("Contracts deployed and configured");
  console.log("UserRoles deployed at:", await userRoles.address);
  console.log("AssetRegistry deployed at:", await assetRegistry.address);
  console.log("AssetMetadata deployed at:", await assetRegistry.assetMetadata());
  console.log("OwnershipContract deployed at:", await assetRegistry.ownershipContract());
  console.log("TransferConditions deployed at:", await assetRegistry.transferConditions());
  console.log("MaintenanceScheduler deployed at:", await maintenanceScheduler.address);
  console.log("Workorder deployed at:", await workOrderContract.address);

};
