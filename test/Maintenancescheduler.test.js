const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const MaintenanceScheduler = artifacts.require("MaintenanceScheduler");
const UserRoles = artifacts.require("UserRoles");
const AssetRegistry = artifacts.require("AssetRegistry");

contract('MaintenanceScheduler', ([deployer, assetManager, nonAssetManager, assetOwner]) => {
  let maintenanceScheduler;
  let userRoles;
  let assetRegistry;

  beforeEach(async () => {
    userRoles = await UserRoles.new();
    assetRegistry = await AssetRegistry.new(userRoles.address);
    maintenanceScheduler = await MaintenanceScheduler.new(userRoles.address, assetRegistry.address);

    // Grant ASSET_MANAGER_ROLE to assetManager
    await userRoles.grantAssetManagerRole(assetManager, { from: deployer });

    // Register an asset and set the owner in AssetRegistry
    await userRoles.grantAssetManagerRole(assetOwner, { from: deployer });
    await assetRegistry.registerAsset(assetOwner, "Asset Details", "Transfer Condition", { from: assetOwner });
  });

  it('should deploy contracts and initialize correctly', async () => {
    assert.equal(await maintenanceScheduler.userRoles(), userRoles.address);
    assert.equal(await maintenanceScheduler.assetRegistry(), assetRegistry.address);
  });

  it('should allow asset manager to schedule maintenance', async () => {
    const tokenId = 0;
    const details = "Maintenance Details";

    const tx = await maintenanceScheduler.scheduleMaintenance(tokenId, details, { from: assetManager });
    expectEvent(tx, 'MaintenanceScheduled', { tokenId: tokenId.toString(), details });

    const maintenanceSchedules = await maintenanceScheduler.getMaintenanceSchedule(tokenId);
    assert.equal(maintenanceSchedules.length, 1);
    assert.equal(maintenanceSchedules[0].details, details);
    assert.isTrue(maintenanceSchedules[0].isScheduled);
  });

  it('should not allow non-asset manager to schedule maintenance', async () => {
    const tokenId = 0;
    const details = "Maintenance Details";

    await expectRevert(
      maintenanceScheduler.scheduleMaintenance(tokenId, details, { from: nonAssetManager }),
      "Caller is not an asset manager"
    );
  });

  it('should not allow scheduling maintenance for a non-existent asset', async () => {
    const tokenId = 9999;
    const details = "Maintenance Details";

    await expectRevert(
      maintenanceScheduler.scheduleMaintenance(tokenId, details, { from: assetManager }),
      "ERC721: invalid token ID"
    );
  });

  it('should allow asset manager to update maintenance details', async () => {
    const tokenId = 0;
    const details = "Maintenance Details";
    const newDetails = "Updated Maintenance Details";

    await maintenanceScheduler.scheduleMaintenance(tokenId, details, { from: assetManager });
    const tx = await maintenanceScheduler.updateMaintenance(tokenId, 0, newDetails, { from: assetManager });
    expectEvent(tx, 'MaintenanceUpdated', { tokenId: tokenId.toString(), index: '0', newDetails });

    const maintenanceSchedules = await maintenanceScheduler.getMaintenanceSchedule(tokenId);
    assert.equal(maintenanceSchedules[0].details, newDetails);
  });

  it('should not allow non-asset manager to update maintenance details', async () => {
    const tokenId = 0;
    const details = "Maintenance Details";
    const newDetails = "Updated Maintenance Details";

    await maintenanceScheduler.scheduleMaintenance(tokenId, details, { from: assetManager });

    await expectRevert(
      maintenanceScheduler.updateMaintenance(tokenId, 0, newDetails, { from: nonAssetManager }),
      "Caller is not an asset manager"
    );
  });

  it('should not allow updating maintenance details for a non-existent asset', async () => {
    const tokenId = 9999;
    const newDetails = "Updated Maintenance Details";

    await expectRevert(
      maintenanceScheduler.updateMaintenance(tokenId, 0, newDetails, { from: assetManager }),
      "ERC721: invalid token ID"
    );
  });

  it('should not allow updating maintenance with invalid index', async () => {
    const tokenId = 0;
    const details = "Maintenance Details";

    await maintenanceScheduler.scheduleMaintenance(tokenId, details, { from: assetManager });

    await expectRevert(
      maintenanceScheduler.updateMaintenance(tokenId, 1, "New Details", { from: assetManager }),
      "Invalid index"
    );
  });

  it('should allow asset manager to update maintenance status', async () => {
    const tokenId = 0;
    const details = "Maintenance Details";
    const isScheduled = false;

    await maintenanceScheduler.scheduleMaintenance(tokenId, details, { from: assetManager });
    const tx = await maintenanceScheduler.updateMaintenanceStatus(tokenId, 0, isScheduled, { from: assetManager });
    expectEvent(tx, 'MaintenanceStatusUpdated', { tokenId: tokenId.toString(), index: '0', isScheduled });

    const maintenanceSchedules = await maintenanceScheduler.getMaintenanceSchedule(tokenId);
    assert.equal(maintenanceSchedules[0].isScheduled, isScheduled);
  });

  it('should not allow non-asset manager to update maintenance status', async () => {
    const tokenId = 0;
    const details = "Maintenance Details";
    const isScheduled = false;

    await maintenanceScheduler.scheduleMaintenance(tokenId, details, { from: assetManager });

    await expectRevert(
      maintenanceScheduler.updateMaintenanceStatus(tokenId, 0, isScheduled, { from: nonAssetManager }),
      "Caller is not an asset manager"
    );
  });

  it('should not allow updating maintenance status for a non-existent asset', async () => {
    const tokenId = 9999; 
    const isScheduled = false;

    await expectRevert(
      maintenanceScheduler.updateMaintenanceStatus(tokenId, 0, isScheduled, { from: assetManager }),
      "ERC721: invalid token ID"
    );
  });

  it('should not allow updating maintenance status with invalid index', async () => {
    const tokenId = 0;
    const details = "Maintenance Details";

    await maintenanceScheduler.scheduleMaintenance(tokenId, details, { from: assetManager });

    await expectRevert(
      maintenanceScheduler.updateMaintenanceStatus(tokenId, 1, false, { from: assetManager }),
      "Invalid index"
    );
  });

  it('should allow retrieving maintenance schedule for an asset', async () => {
    const tokenId = 0;
    const details = "Maintenance Details";

    await maintenanceScheduler.scheduleMaintenance(tokenId, details, { from: assetManager });
    const maintenanceSchedules = await maintenanceScheduler.getMaintenanceSchedule(tokenId);

    assert.equal(maintenanceSchedules.length, 1);
    assert.equal(maintenanceSchedules[0].details, details);
    assert.isTrue(maintenanceSchedules[0].isScheduled);
  });
});
