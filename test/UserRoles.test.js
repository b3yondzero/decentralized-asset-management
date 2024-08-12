const { expectRevert } = require('@openzeppelin/test-helpers');
const UserRoles = artifacts.require("UserRoles");

contract('UserRoles', ([deployer, user1, user2, nonAdmin]) => {
  let userRoles;

  beforeEach(async () => {
    userRoles = await UserRoles.new();
  });

  it('should deploy contracts and initialize correctly', async () => {
    assert.equal(await userRoles.ASSET_MANAGER_ROLE(), web3.utils.keccak256('ASSET_MANAGER_ROLE'));
    assert.equal(await userRoles.MAINTENANCE_STAFF_ROLE(), web3.utils.keccak256('MAINTENANCE_STAFF_ROLE'));
  });

  it('should allow admin to grant asset manager role', async () => {
    await userRoles.grantAssetManagerRole(user1, { from: deployer });
    assert.isTrue(await userRoles.hasRole(await userRoles.ASSET_MANAGER_ROLE(), user1));
  });

  it('should allow admin to grant maintenance staff role', async () => {
    await userRoles.grantMaintenanceStaffRole(user1, { from: deployer });
    assert.isTrue(await userRoles.hasRole(await userRoles.MAINTENANCE_STAFF_ROLE(), user1));
  });

  it('should not allow non-admin to grant asset manager role', async () => {
    await expectRevert(
      userRoles.grantAssetManagerRole(user1, { from: nonAdmin }),
      "Caller is not an admin"
    );
  });

  it('should not allow non-admin to grant maintenance staff role', async () => {
    await expectRevert(
      userRoles.grantMaintenanceStaffRole(user1, { from: nonAdmin }),
      "Caller is not an admin"
    );
  });

  it('should allow admin to revoke asset manager role', async () => {
    await userRoles.grantAssetManagerRole(user1, { from: deployer });
    await userRoles.revokeAssetManagerRole(user1, { from: deployer });
    assert.isFalse(await userRoles.hasRole(await userRoles.ASSET_MANAGER_ROLE(), user1));
  });

  it('should allow admin to revoke maintenance staff role', async () => {
    await userRoles.grantMaintenanceStaffRole(user1, { from: deployer });
    await userRoles.revokeMaintenanceStaffRole(user1, { from: deployer });
    assert.isFalse(await userRoles.hasRole(await userRoles.MAINTENANCE_STAFF_ROLE(), user1));
  });

  it('should not allow non-admin to revoke asset manager role', async () => {
    await userRoles.grantAssetManagerRole(user1, { from: deployer });
    await expectRevert(
      userRoles.revokeAssetManagerRole(user1, { from: nonAdmin }),
      "Caller is not an admin"
    );
  });
  it('should not allow non-admin to revoke maintenance staff role', async () => {
    await userRoles.grantMaintenanceStaffRole(user1, { from: deployer });
    await expectRevert(
      userRoles.revokeMaintenanceStaffRole(user1, { from: nonAdmin }),
      "Caller is not an admin"
    );
  });

  it('should allow admin to grant multiple roles', async () => {
    await userRoles.grantAssetManagerRole(user1, { from: deployer });
    await userRoles.grantMaintenanceStaffRole(user1, { from: deployer });
    assert.isTrue(await userRoles.hasRole(await userRoles.ASSET_MANAGER_ROLE(), user1));
    assert.isTrue(await userRoles.hasRole(await userRoles.MAINTENANCE_STAFF_ROLE(), user1));
  });

  it('should allow admin to revoke muliple roles', async () => {
    await userRoles.grantAssetManagerRole(user1, { from: deployer });
    await userRoles.grantMaintenanceStaffRole(user1, { from: deployer });
    await userRoles.revokeAssetManagerRole(user1, { from: deployer });
    await userRoles.revokeMaintenanceStaffRole(user1, { from: deployer });
    assert.isFalse(await userRoles.hasRole(await userRoles.ASSET_MANAGER_ROLE(), user1));
    assert.isFalse(await userRoles.hasRole(await userRoles.MAINTENANCE_STAFF_ROLE(), user1));
  });
});
