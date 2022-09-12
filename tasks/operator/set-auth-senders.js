task("set-auth-senders", "Calls an Operator contract to set the list of authorised sender nodes")
  .addParam("contract", "The address of the Operator contract that you want to call")
  .addParam("addresses", "Comma-separated list of the addresses to set as authorised senders. It will replace all existing values")
  .setAction(async (taskArgs) => {
    const contractAddr = taskArgs.contract
    const addresses = taskArgs.addresses
    const networkId = network.name

    console.log("Updating auth. senders in Operator contract", contractAddr, "on network", networkId)
    const Operator = await ethers.getContractFactory("Operator")

    //Get signer information
    const accounts = await ethers.getSigners()
    const signer = accounts[0]

    //Create connection to Consumer Contract and call the setter function
    const operatorContract = new ethers.Contract(contractAddr, Operator.interface, signer)
    let addressArr = addresses.split(',')
    let value = await operatorContract.setAuthorizedSenders(addressArr)
    console.log("Done")
  })

module.exports = {}