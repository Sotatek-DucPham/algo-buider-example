const crypto = require("crypto");

const { executeTransaction, balanceOf } = require("@algo-builder/algob");
const { mkParam } = require("./interaction/common");
/*
  Create "gold" Algorand Standard Asset (ASA).
  Accounts are loaded from config.
  To use ASA, accounts have to opt-in. Owner is opt-in by default.
*/

async function run(runtimeEnv, deployer) {
  console.log("[gold]: Script has started execution!");

  const goldOwner = deployer.accountsByName.get("alice");

  // create an assetMetadataHash as Uint8Array
  const metadataHash = crypto
    .createHash("sha256")
    .update("some content")
    .digest();
  const asaInfo = await deployer.deployASA(
    "sotaflex",
    {
      creator: goldOwner,
      // totalFee: 1001,
      // feePerByte: 100,
      // firstValid: 10,
      // validRounds: 1002
    },
    {
      metadataHash,
      reserve: goldOwner.addr, // override default value set in asa.yaml
      // freeze: bob.addr
      // note: "gold-asa"
    }
  );
  console.log(asaInfo);

  // In asa.yaml we only added `john` to opt-in accounts. Let's add `bob` as well using the
  // script;
  // await deployer.optInAccountToASA("gold", "bob", {});

  // to interact with an asset we need asset ID. We can get it from the returned object:
  const assetID = asaInfo.assetIndex;

  // we can inspect the balance of the goldOnwer. It should equal to the `total` value defined
  // in the asa.yaml.
  console.log("Balance: ", await balanceOf(deployer, goldOwner.addr, assetID));

  console.log("[gold]: Script execution has finished!");
}

module.exports = { default: run };
