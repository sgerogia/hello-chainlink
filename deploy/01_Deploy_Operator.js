const { getNamedAccounts, deployments, network, run } = require("hardhat")
const {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")
const { verify } = require("../helper-functions")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  const linkToken = networkConfig[chainId]["linkToken"]

  // We are NOT on a local development network, we need to deploy the real Operator!
  if (chainId != 31337) {
    log("Live network detected.")
    const args = [linkToken, deployer]

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const oracle = await deploy("Operator", {
      from: deployer,
      log: true,
      args: args,
      waitConfirmations: waitBlockConfirmations,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(oracle.address, args)
    }

    log("Operator Deployed!")
    log("----------------------------------------------------")
    log("You can now interact with the Operator contract with the following commands:")
    const networkName = network.name == "hardhat" ? "localhost" : network.name
    log(`npx hardhat is-auth-sender --contract ${oracle.address} --address <YOUR_NODE_ADDRESS> --network ${networkName}`)
    log(`npx hardhat auth-senders --contract ${oracle.address} --network ${networkName}`)
    log(`npx hardhat set-auth-senders --contract ${oracle.address} --addresses <COMMA_SEPARATED_LIST,OF_NODE_ADDRESSES> --network ${networkName}`)
    log("----------------------------------------------------")
  } else {
    log("Test network detected. Skipping Operator deployment...")
  }
}

module.exports.tags = ["all", "oracle", "main"]
