const {
  executeTransaction,
  convert,
  balanceOf,
  readAppGlobalState,
} = require("@algo-builder/algob");
const { types } = require("@algo-builder/web");

async function run(runtimeEnv, deployer) {
  const alice = deployer.accountsByName.get("alice");
  const buyer = deployer.accountsByName.get("bob");

  // create nft
  console.log("create nft");
  const asaInfo = await deployer.deployASADef(
    "algobot",
    {
      total: 1,
      decimals: 0,
      defaultFrozen: true,
      unitName: "Algobot",
      assetName: "Algobot",
      url: "url",
      metadataHash: "12312442142141241244444411111133",
      note: "note",
      manager: alice.addr,
      reserve: alice.addr,
      clawback: alice.addr,
      freeze: alice.addr,
    },
    {
      creator: alice,
    }
  );
  console.log(asaInfo);
  console.log(
    "NFT Balance: ",
    await balanceOf(deployer, alice.addr, asaInfo.assetIndex)
  );

  // app_initialize
  const appArgs = [
    convert.addressToPk(alice.addr),
    convert.addressToPk(alice.addr),
  ];
  // Create Application
  // Note: An Account can have maximum of 10 Applications.
  const sscInfo = await deployer.deployApp(
    "nft_marketplace_approval.py", // approval program
    "nft_marketplace_clear.py", // clear program
    {
      sender: alice,
      localInts: 0,
      localBytes: 0,
      globalInts: 3,
      globalBytes: 3,
      appArgs,
      foreignAssets: [asaInfo.assetIndex],
    },
    {}
  );
  console.log(sscInfo);

  // stateless
  console.log("====== escrow deploy");
  const scInitParam = { APP_ID: sscInfo.appID, ASA_ID: asaInfo.assetIndex };
  console.log({ scInitParam });
  const nftEscrowLsig = await deployer.loadLogic("nft_escrow.py", scInitParam);
  const nftEscrowLsigAddress = nftEscrowLsig.address();
  console.log({ nftEscrowLsigAddress });

  console.log("====== change nft credentials txn");
  const assetConfigParams = {
    type: types.TransactionType.ModifyAsset,
    sign: types.SignType.SecretKey,
    fromAccount: alice,
    assetID: asaInfo.assetIndex,
    fields: {
      manager: "",
      reserve: "",
      freeze: "",
      strictEmptyAddressChecking: false,
      clawback: nftEscrowLsigAddress,
    },
    payFlags: { totalFee: 1000 },
  };
  await executeTransaction(deployer, assetConfigParams);
  console.log(
    "Asset reserve address after updating reserve: ",
    await deployer.getAssetByID(asaInfo.assetIndex)
  );

  {
    console.log("======= initialize_escrow");
    const appArgs = [
      convert.stringToBytes("initializeEscrow"),
      convert.addressToPk(nftEscrowLsigAddress),
    ];
    const tx = {
      type: types.TransactionType.CallApp,
      sign: types.SignType.SecretKey,
      fromAccount: alice,
      appID: sscInfo.appID,
      payFlags: {},
      appArgs,
      foreignAssets: [asaInfo.assetIndex],
    };
    await executeTransaction(deployer, tx);

    globalState = await readAppGlobalState(deployer, alice.addr, sscInfo.appID);
    console.log(globalState);
  }

  {
    console.log("====== fund_escrow");
    await deployer.fundLsig(
      "nft_escrow.py",
      { funder: alice, fundingMicroAlgo: 1e6 }, // 1 algo
      {},
      scInitParam
    );
  }

  {
    console.log("====== make sell offer");
    const appArgs = [
      convert.stringToBytes("makeSellOffer"),
      convert.uint64ToBigEndian(100000),
    ];
    const tx = {
      type: types.TransactionType.CallApp,
      sign: types.SignType.SecretKey,
      fromAccount: alice,
      appID: sscInfo.appID,
      payFlags: {},
      appArgs,
      foreignAssets: [asaInfo.assetIndex],
    };
    await executeTransaction(deployer, tx);

    console.log(await readAppGlobalState(deployer, alice.addr, sscInfo.appID));
  }

  {
    console.log("====== opt in");
    const tx = {
      type: types.TransactionType.OptInASA,
      sign: types.SignType.SecretKey,
      fromAccount: buyer,
      assetID: asaInfo.assetIndex,
      payFlags: {},
    };
    await executeTransaction(deployer, tx);
  }

  // {
  //   console.log("====== opt in");
  //   const tx = {
  //     type: types.TransactionType.OptInASA,
  //     sign: types.SignType.LogicSignature,
  //     fromAccountAddr: nftEscrowLsig.address(),
  //     assetID: asaInfo.assetIndex,
  //     lsig: nftEscrowLsig,
  //     payFlags: {},
  //   };
  //   await executeTransaction(deployer, tx);
  // }

  {
    console.log("====== buy nft");
    const appArgs = [convert.stringToBytes("buy")];

    const txGroup = [
      {
        type: types.TransactionType.CallApp,
        sign: types.SignType.SecretKey,
        fromAccount: buyer,
        appID: sscInfo.appID,
        payFlags: {},
        appArgs,
      },
      {
        type: types.TransactionType.TransferAlgo,
        sign: types.SignType.SecretKey,
        fromAccount: buyer,
        toAccountAddr: alice.addr,
        amountMicroAlgos: 100000,
        payFlags: {},
      },
      {
        type: types.TransactionType.TransferAsset,
        sign: types.SignType.LogicSignature,
        fromAccountAddr: nftEscrowLsigAddress,
        toAccountAddr: buyer.addr,
        amount: 1,
        assetID: asaInfo.assetIndex,
        lsig: nftEscrowLsig,
        revocationTarget: alice.addr,
        payFlags: { totalFee: 1000 },
      },
    ];
    await executeTransaction(deployer, txGroup);

    globalState = await readAppGlobalState(deployer, alice.addr, sscInfo.appID);
    console.log(globalState);
  }
}

module.exports = { default: run };
