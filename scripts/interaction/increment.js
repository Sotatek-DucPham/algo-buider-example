const {
  readAppGlobalState,
  executeTransaction,
  convert,
} = require("@algo-builder/algob");
const { types } = require("@algo-builder/web");

async function run(runtimeEnv, deployer) {
  const creatorAccount = deployer.accountsByName.get("alice");

  // Retreive AppInfo from checkpoints.
  const appInfo = deployer.getApp(
    "increment_approval.py",
    "increment_clear.py"
  );
  const applicationID = appInfo.appID;
  console.log("Application Id ", applicationID);

  // Retreive Global State
  let globalState = await readAppGlobalState(
    deployer,
    creatorAccount.addr,
    applicationID
  );
  console.log(globalState);

  const appArgs = [convert.stringToBytes("increment")];
  const tx = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: creatorAccount,
    appID: applicationID,
    payFlags: {},
    appArgs,
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
