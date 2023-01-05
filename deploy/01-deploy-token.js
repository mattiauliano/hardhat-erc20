const {
  developmentChains,
  INITIAL_SUPPLY,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
require("dotenv").config();
const { verify } = require("../helper-functions");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const failureToken = await deploy("FailureToken", {
    from: deployer,
    args: [INITIAL_SUPPLY],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // Verify contract
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(failureToken.address, [INITIAL_SUPPLY]);
  }
};

module.exports.tags = ["all", "token"];
