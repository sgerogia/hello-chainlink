const { assert, expect } = require("chai")
const { utils } = require('ethers')
const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")


!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Flight Data Consumer Unit Tests", async function () {
      let apiConsumer, linkToken, mockOperator, chainId, fee

      beforeEach(async () => {
        chainId = network.config.chainId
        fee = networkConfig[chainId]["fee"]
        // Tag script selectors from the `/deploy` folder
        await deployments.fixture(["mocks", "api"])
        linkToken = await ethers.getContract("LinkToken")
        linkTokenAddress = linkToken.address
        additionalMessage = ` --linkaddress  ${linkTokenAddress}`
        apiConsumer = await ethers.getContract("FlightDataConsumer")
        mockOperator = await ethers.getContract("MockOperator")

        await hre.run("fund-link", { contract: apiConsumer.address, linkaddress: linkTokenAddress })
      })

      it("Should successfully make a data request", async () => {
        // act
        const transaction = await apiConsumer.requestFlightData("LHR", "2022/08/26")
        const transactionReceipt = await transaction.wait()
        // assert
        // ...ChainlinkRequested event
        const requestId = transactionReceipt.events[0].topics[1]
//        console.log("RequestId: ", requestId)
        expect(requestId).to.not.be.null
      })

      it("Should successfully make a data request and get a result", async () => {
        // arrange
        const airport = "LHR"
        const date = "2022/08/26"
        const status = "Arrived"
        const scheduledTime = "2022/08/26 17:10Z"
        const actualTime = "2022/08/26 17:20Z"
        // ...the Flight Data contract 'fulfill' method address (callback)
        const fulfillFunctionId = utils.id('fulfill(bytes32,string,string,string,string)').substring(0, 10)

        // act
        const reqTrx = await apiConsumer.requestFlightData(airport, date)
        const reqTrxReceipt = await reqTrx.wait()
        // ...ChainlinkRequested event
        const requestId = reqTrxReceipt.events[0].topics[1]
//        console.log("Request id: ", requestId)
        // ...wait for the OracleRequest event (Oracle -> Node) and get its fields
        let expiration
        let p = new Promise(resolve => {
            mockOperator.once("OracleRequest", async (specId, requester, eventRequestId, payment,
                callbackAddr, callbackFunctionId, cancelExpiration, dataVersion, requestData, event) => {

                console.log("OracleRequest received")
                expiration = cancelExpiration
                assert.equal(requestId, eventRequestId)
                assert.equal(fulfillFunctionId, callbackFunctionId)
                assert.equal(apiConsumer.address, callbackAddr)
                resolve()
            })
        })
        await p

        // ...build the multi-word response payload
        const responseData = ethers.utils.defaultAbiCoder.encode(
            ["bytes32", "string", "string", "string", "string"],
            [requestId, status, airport, scheduledTime, actualTime],
        )

        // ...pretend we are the node and fulfill the request (Node -> Oracle)
        console.log("Calling MockOperator.fulfillOracleRequest2...")
        const oracleTrx = await mockOperator.fulfillOracleRequest2(
            requestId,
            fee,
            apiConsumer.address,
            fulfillFunctionId,
            expiration,
            responseData)
        const oracleTrxReceipt = await oracleTrx.wait()


        // assert

        // ...wait for the OracleResponse message
//        p = new Promise(resolve => {
//            mockOperator.once("OracleResponse", (_requestId, event) => {
//
//                console.log("OracleResponse received")
//                assert.equal(requestId, _requestId)
//                resolve()
//            })
//        })
//        await p

        // ...wait for the ChainlinkFulfilled message
//        p = new Promise(resolve => {
//            apiConsumer.on("ChainlinkFulfilled", (_requestId, event) => {
//
//                console.log("ChainlinkFulfilled received")
//                assert.equal(requestId, _requestId)
//                resolve()
//            })
//        })
//        await p

        // ...wait for the DataFullfilled message
        p = new Promise(resolve => {
            apiConsumer.on("DataFulfilled", (_status, _airport, _scheduledArrival, _actualArrival, event) => {

                console.log("DataFulfilled received")
                assert.equal(_status, status)
                assert.equal(_airport, airport)
                assert.equal(_scheduledArrival, scheduledTime)
                assert.equal(_actualArrival, actualTime)
                resolve()
            })
        })
        await p

        // ...make sure Oracle has updated our Flight Data contract
        const _status = await apiConsumer.flightStatus()
        const _airport = await apiConsumer.arrivalAirport()
        const _scheduledTime = await apiConsumer.scheduledArrivalTime()
        const _actualTime = await apiConsumer.actualArrivalTime()
        assert.equal(_status, status)
        assert.equal(_airport, airport)
        assert.equal(_scheduledTime, scheduledTime)
        assert.equal(_actualTime, actualTime)

      })

    })