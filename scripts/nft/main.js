const {
  readAppGlobalState,
  executeTransaction,
  convert,
} = require("@algo-builder/algob");
const { types } = require("@algo-builder/web");

async function run(runtimeEnv, deployer) {
  const creatorAccount = deployer.accountsByName.get("alice");
  const sotaflex = deployer.asa.get("sotaflex");

  // Retreive AppInfo from checkpoints.
  const appInfo = deployer.getApp(
    "nft_marketplace_approval.py",
    "nft_marketplace_clear.py"
  );
  const applicationID = appInfo.appID;
  console.log("Application Id ", applicationID);

  const nftEscrowLsig = await deployer.loadLogic("nft_escrow.py", {
    APP_ID: applicationID,
    ASA_ID: sotaflex.assetIndex,
  });
  console.log("nftEscrowLsig", nftEscrowLsig.address());

  // Retreive Global State
  let globalState = await readAppGlobalState(
    deployer,
    creatorAccount.addr,
    applicationID
  );
  console.log(globalState);

  const appArgs = [
    convert.stringToBytes("initializeEscrow"),
    convert.addressToPk(nftEscrowLsig.address()),
  ];
  const tx = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: creatorAccount,
    appID: applicationID,
    payFlags: {},
    appArgs,
    foreignAssets: [sotaflex.assetIndex],
  };
  await executeTransaction(deployer, tx);

  globalState = await readAppGlobalState(
    deployer,
    creatorAccount.addr,
    applicationID
  );
  console.log(globalState);
}

module.exports = { default: run };
