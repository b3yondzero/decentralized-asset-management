const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const WorkOrder = artifacts.require("Workorder");
const UserRoles = artifacts.require("UserRoles");
const AssetRegistry = artifacts.require("AssetRegistry");

contract('WorkOrder', ([deployer, maintenanceStaff, nonMaintenanceStaff, assetOwner]) => {
  let workOrderContract;
  let userRoles;
  let assetRegistry;

  beforeEach(async () => {
    userRoles = await UserRoles.new();
    assetRegistry = await AssetRegistry.new(userRoles.address);
    workOrderContract = await WorkOrder.new(userRoles.address, assetRegistry.address);

    // Grant MAINTENANCE_STAFF_ROLE to maintenanceStaff
    await userRoles.grantMaintenanceStaffRole(maintenanceStaff, { from: deployer });

    // Register an asset and set the owner in AssetRegistry
    await userRoles.grantAssetManagerRole(assetOwner);
    await assetRegistry.registerAsset(assetOwner, "Asset Details", "Transfer Condition", { from: assetOwner });
  });

  it('should deploy contracts and initialize correctly', async () => {
    assert.equal(await workOrderContract.userRoles(), userRoles.address);
    assert.equal(await workOrderContract.assetRegistry(), assetRegistry.address);
  });

  it('should allow maintenance staff to create a work order', async () => {
    const tokenId = 0;
    const details = "Work Order Details";

    const tx = await workOrderContract.createWorkOrder(tokenId, details, { from: maintenanceStaff });
    expectEvent(tx, 'WorkOrderCreated', { tokenId: tokenId.toString(), details });

    const workOrders = await workOrderContract.getWorkOrders(tokenId);
    assert.equal(workOrders.length, 1);
    assert.equal(workOrders[0].details, details);
    assert.isFalse(workOrders[0].isCompleted);
  });

  it('should not allow non-maintenance staff to create a work order', async () => {
    const tokenId = 0;
    const details = "Work Order Details";

    await expectRevert(
      workOrderContract.createWorkOrder(tokenId, details, { from: nonMaintenanceStaff }),
      "Caller is not maintenance staff"
    );
  });

  it('should not allow creating a work order for a non-existent asset', async () => {
    const tokenId = 9999; 
    const details = "Work Order Details";

    await expectRevert(
      workOrderContract.createWorkOrder(tokenId, details, { from: maintenanceStaff }),
      "ERC721: invalid token ID"
    );
  });

  it('should allow maintenance staff to update a work order', async () => {
    const tokenId = 0;
    const details = "Work Order Details";
    const newDetails = "Updated Work Order Details";

    await workOrderContract.createWorkOrder(tokenId, details, { from: maintenanceStaff });
    const tx = await workOrderContract.updateWorkOrder(tokenId, 0, newDetails, true, { from: maintenanceStaff });
    expectEvent(tx, 'WorkOrderUpdated', { tokenId: tokenId.toString(), index: '0', newDetails, isCompleted: true });

    const workOrders = await workOrderContract.getWorkOrders(tokenId);
    assert.equal(workOrders[0].details, newDetails);
    assert.isTrue(workOrders[0].isCompleted);
  });

  it('should not allow non-maintenance staff to update a work order', async () => {
    const tokenId = 0;
    const details = "Work Order Details";
    const newDetails = "Updated Work Order Details";

    await workOrderContract.createWorkOrder(tokenId, details, { from: maintenanceStaff });

    await expectRevert(
      workOrderContract.updateWorkOrder(tokenId, 0, newDetails, true, { from: nonMaintenanceStaff }),
      "Caller is not maintenance staff"
    );
  });

  it('should not allow updating a work order for a non-existent asset', async () => {
    const tokenId = 9999; 
    const newDetails = "Updated Work Order Details";

    await expectRevert(
      workOrderContract.updateWorkOrder(tokenId, 0, newDetails, true, { from: maintenanceStaff }),
      "ERC721: invalid token ID"
    );
  });

  it('should not allow updating a work order with invalid index', async () => {
    const tokenId = 0;
    const details = "Work Order Details";
    const newDetails = "Updated Work Order Details";

    await workOrderContract.createWorkOrder(tokenId, details, { from: maintenanceStaff });

    await expectRevert(
      workOrderContract.updateWorkOrder(tokenId, 1, newDetails, true, { from: maintenanceStaff }),
      "Invalid index"
    );
  });

  it('should allow retrieving work orders for an asset', async () => {
    const tokenId = 0;
    const details = "Work Order Details";

    await workOrderContract.createWorkOrder(tokenId, details, { from: maintenanceStaff });
    const workOrders = await workOrderContract.getWorkOrders(tokenId);

    assert.equal(workOrders.length, 1);
    assert.equal(workOrders[0].details, details);
    assert.isFalse(workOrders[0].isCompleted);
  });
});
