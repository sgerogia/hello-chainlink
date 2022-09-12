task("set-jobid", "Updates the Job id on a Flight Data Consumer contract")
  .addParam("contract", "The address of the Flight Data Consumer contract that you want to call")
  .addParam("jobid", "The new job id, without dashes")
  .setAction(async (taskArgs) => {
    const contractAddr = taskArgs.contract
    const jobId = taskArgs.jobid
    const networkId = network.name

    console.log("Updating JobId in Flight Data Consumer contract", contractAddr, "on network", networkId, "to", jobId)
    const FlightDataConsumer = await ethers.getContractFactory("FlightDataConsumer")

    //Get signer information
    const accounts = await ethers.getSigners()
    const signer = accounts[0]

    //Create connection to Consumer Contract and call the setter function
    const apiContract = new ethers.Contract(contractAddr, FlightDataConsumer.interface, signer)
    // get the current value
    const _jobId = await apiContract.jobId()
    console.log("Old JobId value:", ethers.utils.toUtf8String(_jobId))
    // update the job id
    await apiContract.setJobId(ethers.utils.toUtf8Bytes(jobId))
    console.log("Done")
  })

async function printNewJobId(apiContract) {
    const _newJobId = await apiContract.jobId()
    console.log("New JobId value:", _newJobId)
}

module.exports = {}