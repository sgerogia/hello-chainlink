const { networkConfig } = require("../../helper-hardhat-config")

task("request-data", "Calls the Flight Data Consumer Contract to request external data")
  .addParam("contract", "The address of the API Consumer contract that you want to call")
  .addParam("flight", "The IATA code of the flight")
  .addParam("date", "The ISO-8601 date of departure for the flight")
  .setAction(async (taskArgs) => {
    const contractAddr = taskArgs.contract
    const flight = taskArgs.flight
    const date = taskArgs.date
    let networkId = network.config.chainId
    console.log("Calling Flight Data Consumer contract ", contractAddr, " on network ", network.name)
    const APIConsumer = await ethers.getContractFactory("FlightDataConsumer")

    //Get signer information
    const accounts = await ethers.getSigners()
    const signer = accounts[0]

    //Create connection to Consumer Contract and call the function
    const apiConsumerContract = new ethers.Contract(contractAddr, FlightDataConsumer.interface, signer)
    var result = await apiConsumerContract.requestFlightData(flight, date)
    console.log(
      "Contract ",
      contractAddr,
      " external data request successfully called. Transaction Hash: ",
      result.hash
    )
    console.log("Run the following to read the returned result:")
    console.log("npx hardhat read-data --contract " + contractAddr + " --network " + network.name)
  })
module.exports = {}
