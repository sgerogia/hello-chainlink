task("is-auth-sender", "Calls an Operator contract to check if a node address is an authorised sender")
  .addParam("contract", "The address of the Operator contract that you want to call")
  .addParam("address", "The Chainlink node address to check")
  .setAction(async (taskArgs) => {
    const contractAddr = taskArgs.contract
    const nodeAddr = taskArgs.address
    const networkId = network.name

    console.log("Checking auth. sender", nodeAddr, "in Operator contract", contractAddr, "on network", networkId)
    const Operator = await ethers.getContractFactory("Operator")

    //Get signer information
    const accounts = await ethers.getSigners()
    const signer = accounts[0]

    //Create connection to Consumer Contract and call the getter function
    const operatorContract = new ethers.Contract(contractAddr, Operator.interface, signer)
    let value = await operatorContract.isAuthorizedSender(nodeAddr)
    console.log("Authorized: %s", value)
  })

module.exports = {}