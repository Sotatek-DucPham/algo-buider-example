const { executeTransaction } = require("@algo-builder/algob");
const { types } = require("@algo-builder/web");

async function run(runtimeEnv, deployer) {
  const masterAccount = deployer.accountsByName.get("master-account");
  const creatorAccount = deployer.accountsByName.get("alice");
  const bob = deployer.accountsByName.get("bob");

  const txGroup = [
    {
      type: types.TransactionType.TransferAlgo,
      sign: types.SignType.SecretKey,
      fromAccount: masterAccount,
      toAccountAddr: creatorAccount.addr,
      amountMicroAlgos: 200e6,
      payFlags: {},
    },
    {
      type: types.TransactionType.TransferAlgo,
      sign: types.SignType.SecretKey,
      fromAccount: masterAccount,
      toAccountAddr: bob.addr,
      amountMicroAlgos: 200e6,
      payFlags: {},
    },
  ];
  // transfer some algos to creator account
  await executeTransaction(deployer, txGroup);
}

module.exports = { default: run };
