task("auth-senders", "Calls an Operator contract to retrieve the list of authorised sender nodes")
  .addParam("contract", "The address of the Operator contract that you want to call")
  .setAction(async (taskArgs) => {
    const contractAddr = taskArgs.contract
    const networkId = network.name

    console.log("Fetching auth. senders from Operator contract", contractAddr, "on network", networkId)
    const Operator = await ethers.getContractFactory("Operator")

    //Get signer information
    const accounts = await ethers.getSigners()
    const signer = accounts[0]

    //Create connection to Consumer Contract and call the getter function
    const operatorContract = new ethers.Contract(contractAddr, Operator.interface, signer)
    let value = await operatorContract.getAuthorizedSenders()
    console.log("Authorized senders: %s", value)
  })

module.exports = {}