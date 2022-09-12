const { networkConfig } = require("../helper-hardhat-config")

task("withdraw-eth", "Returns any ETH left in a deployed Flight Data consumer contract")
  .addParam("contract", "The address of the contract")
  .setAction(async (taskArgs) => {
    const contractAddr = taskArgs.contract
    const networkId = network.config.chainId
    const provider = ethers.getDefaultProvider(networkId)

    //Get signer information
    const accounts = await hre.ethers.getSigners()
    const signer = accounts[0]

    //First, lets see if there is any ETH to withdraw
    const balanceHex = await provider.getBalance(contractAddr)
    const balance = await ethers.BigNumber.from(balanceHex._hex).toString()
    console.log("ETH balance of contract:", contractAddr, "is", balance / Math.pow(10, 18))

    if (balance > 0) {
      // Client contract
      const FlightDataConsumer = await ethers.getContractFactory("FlightDataConsumer")

      //Create connection to Consumer Contract and call the withdraw function
      const ConsumerContract = new ethers.Contract(
        contractAddr,
        FlightDataConsumer.interface,
        signer
      )
      const result = await ConsumerContract.withdrawEth()
      console.log(
        "All ETH withdrew from contract", contractAddr,
        "Transaction Hash:",
        result.hash
      )
    } else {
      console.log("Contract doesn't have any ETH to withdraw")
    }
  })

module.exports = {}
