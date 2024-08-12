const { expectRevert } = require('@openzeppelin/test-helpers');
const AssetRegistry = artifacts.require("AssetRegistry");
const UserRoles = artifacts.require("UserRoles");

contract('AssetRegistry', ([assetManager, newOwner, nonAssetManager]) => {
  let assetRegistry;
  let userRoles;

  beforeEach(async () => {
    userRoles = await UserRoles.new();
    assetRegistry = await AssetRegistry.new(userRoles.address);

    // Grant ASSET_MANAGER_ROLE to assetManager and newOwner
    await userRoles.grantAssetManagerRole(assetManager);
    await userRoles.grantAssetManagerRole(newOwner);
  });

  it('should deploy contracts and initialize correctly', async () => {
    assert.equal(await assetRegistry.name(), 'AssetRegistry');
    assert.equal(await assetRegistry.symbol(), 'ASSET');
  });

  it('should allow assetManager to register an asset', async () => {
    const details = "Asset Details";
    const transferCondition = "Transfer Condition";

    const tx = await assetRegistry.registerAsset(assetManager, details, transferCondition, { from: assetManager });
    const tokenId = tx.logs[0].args.tokenId.toNumber();
    assert.equal(await assetRegistry.getAssetDetails(tokenId), details);
    assert.equal(await assetRegistry.getTransferCondition(tokenId), transferCondition);
    assert.equal(await assetRegistry.getOwnership(tokenId), assetManager);
});

  it('should not allow non-assetManager to register an asset', async () => {
    await expectRevert(
      assetRegistry.registerAsset(assetManager, "Details", "Condition", { from: nonAssetManager }),
      "Caller is not an asset manager"
    );
  });

  it('should allow assetManager to transfer ownership', async () => {
    const details = "Asset Details";
    const transferCondition = "Transfer Condition";
    const tx = await assetRegistry.registerAsset(assetManager, details, transferCondition, { from: assetManager });
    const tokenId = tx.logs[0].args.tokenId.toNumber();

    await assetRegistry.transferOwnership(tokenId, newOwner, { from: assetManager });
    await assetRegistry.acceptOwnership(tokenId, { from: newOwner });

    assert.equal(await assetRegistry.getOwnership(tokenId), newOwner);
  });

  it('should not allow non-assetManager to transfer ownership', async () => {
    const details = "Asset Details";
    const transferCondition = "Transfer Condition";
    const tx = await assetRegistry.registerAsset(assetManager, details, transferCondition, { from: assetManager });
    const tokenId = tx.logs[0].args.tokenId.toNumber();

    await expectRevert(
      assetRegistry.transferOwnership(tokenId, newOwner, { from: nonAssetManager }),
      "Caller is not an asset manager"
    );
  });

  it('should allow assetManager to set transfer condition', async () => {
    const details = "Asset Details";
    const transferCondition = "Transfer Condition";
    const newCondition = "New Condition";

    const tx = await assetRegistry.registerAsset(assetManager, details, transferCondition, { from: assetManager });
    const tokenId = tx.logs[0].args.tokenId.toNumber();

    await assetRegistry.setTransferCondition(tokenId, newCondition, { from: assetManager });
    assert.equal(await assetRegistry.getTransferCondition(tokenId), newCondition);
  });

  it('should not allow non-assetManager to set transfer condition', async () => {
    const details = "Asset Details";
    const transferCondition = "Transfer Condition";

    const tx = await assetRegistry.registerAsset(assetManager, details, transferCondition, { from: assetManager });
    const tokenId = tx.logs[0].args.tokenId.toNumber();

    await expectRevert(
      assetRegistry.setTransferCondition(tokenId, "New Condition", { from: nonAssetManager }),
      "Caller is not an asset manager"
    );
  });

  it('should maintain asset metadata after ownership transfer', async () => {
    const details = "Asset Details";
    const transferCondition = "Transfer Condition";

    const tx = await assetRegistry.registerAsset(assetManager, details, transferCondition, { from: assetManager });
    const tokenId = tx.logs[0].args.tokenId.toNumber();

    await assetRegistry.transferOwnership(tokenId, newOwner, { from: assetManager });
    await assetRegistry.acceptOwnership(tokenId, { from: newOwner });

    assert.equal(await assetRegistry.getAssetDetails(tokenId), details);
  });

  it('should not allow non-assetManager to call acceptOwnership', async () => {
    const details = "Asset Details";
    const transferCondition = "Transfer Condition";

    const tx = await assetRegistry.registerAsset(assetManager, details, transferCondition, { from: assetManager });
    const tokenId = tx.logs[0].args.tokenId.toNumber();

    await assetRegistry.transferOwnership(tokenId, newOwner, { from: assetManager });

    await expectRevert(
        assetRegistry.acceptOwnership(tokenId, { from: nonAssetManager }),
        "Caller is not an asset manager"
    );
  });

  it('should not allow ownership transfer with invalid token ID', async () => {
    await expectRevert(
        assetRegistry.transferOwnership(9999, newOwner, { from: assetManager }),
        "ERC721: invalid token ID"
    );

    await expectRevert(
        assetRegistry.acceptOwnership(9999, { from: newOwner }),
        "ERC721: invalid token ID"
    );
});
it('should not allow access to details of a non-existent asset', async () => {
  await expectRevert(
      assetRegistry.getAssetDetails(9999),
      "ERC721: invalid token ID"
  );
});

it('should not allow setting transfer condition for a non-existent asset', async () => {
  await expectRevert(
      assetRegistry.setTransferCondition(9999, "New Condition", { from: assetManager }),
      "ERC721: invalid token ID"
  );
});

it('should register assets with unique token IDs', async () => {
  const details1 = "Asset Details 1";
  const details2 = "Asset Details 2";
  const transferCondition1 = "Transfer Condition 1";
  const transferCondition2 = "Transfer Condition 2";

  const tx1 = await assetRegistry.registerAsset(assetManager, details1, transferCondition1, { from: assetManager });
  const tokenId1 = tx1.logs[0].args.tokenId.toNumber();

  const tx2 = await assetRegistry.registerAsset(assetManager, details2, transferCondition2, { from: assetManager });
  const tokenId2 = tx2.logs[0].args.tokenId.toNumber();

  assert.notEqual(tokenId1, tokenId2, "Token IDs should be unique");
  assert.equal(await assetRegistry.getAssetDetails(tokenId1), details1);
  assert.equal(await assetRegistry.getAssetDetails(tokenId2), details2);
  });

});
