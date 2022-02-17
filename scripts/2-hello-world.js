const { executeTransaction } = require("@algo-builder/algob");
const { types } = require("@algo-builder/web");

async function run(runtimeEnv, deployer) {
  const creatorAccount = deployer.accountsByName.get("alice");

  // Create Application
  // Note: An Account can have maximum of 10 Applications.
  const sscInfo = await deployer.deployApp(
    "hello_world_approval.py", // approval program
    "hello_world_clear.py", // clear program
    {
      sender: creatorAccount,
      localInts: 0,
      localBytes: 0,
      globalInts: 0,
      globalBytes: 1,
    },
    {}
  );

  console.log(sscInfo);

  // Opt-In for creator
  await deployer.optInAccountToApp(creatorAccount, sscInfo.appID, {}, {});
}

module.exports = { default: run };
