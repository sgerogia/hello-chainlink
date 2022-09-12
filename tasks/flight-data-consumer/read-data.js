task("read-data", "Calls a Flight Data Consumer Contract to read data obtained from an external API")
  .addParam("contract", "The address of the API Consumer contract that you want to call")
  .setAction(async (taskArgs) => {
    const contractAddr = taskArgs.contract
    const networkId = network.name
    console.log("Reading data from Flight Data Consumer contract", contractAddr, "on network", networkId)
    const FlightDataConsumer = await ethers.getContractFactory("FlightDataConsumer")

    //Get signer information
    const accounts = await ethers.getSigners()
    const signer = accounts[0]

    //Create connection to Consumer Contract and call the getter function
    const apiConsumerContract = new ethers.Contract(contractAddr, FlightDataConsumer.interface, signer)
    let status = await apiConsumerContract.flightStatus()
    let airport = await apiConsumerContract.arrivalAirport()
    let scheduledArrival = await apiConsumerContract.scheduledArrivalTime()
    let actualArrival = await apiConsumerContract.actualArrivalTime()

    if (status == "" && ["hardhat", "localhost", "ganache"].indexOf(network.name) == 0) { // not local
      console.log("You'll either need to wait another minute, or fix something!")
    } else if (status == "" && ["hardhat", "localhost", "ganache"].indexOf(network.name) >= 0) { // local
      console.log("You'll have to manually update the value since you're on a local chain!")
    } else {
        console.log("Status: %s, Airport: %s, Sched. arrival: %s, Actual arrival: %s", status, airport, scheduledArrival, actualArrival)
    }
  })

module.exports = {}
