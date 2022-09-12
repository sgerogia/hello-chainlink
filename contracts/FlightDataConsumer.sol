// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title The demo Flight Data Consumer contract.
 * @notice A demo Chainlink client contract making requests for any combination of date and flight, then emitting an event with the result.
 *       DO NOT USE IN PRODUCTION!
 */
contract FlightDataConsumer is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;

    string public flightStatus;
    string public arrivalAirport;
    string public scheduledArrivalTime;
    string public actualArrivalTime;

    bytes32 public jobId;
    uint256 private immutable fee;

    event DataFulfilled(
        string flightStatus,
        string arrivalAirport,
        string scheduledArrivalTime,
        string actualArrivalTime);

    /**
     * @notice Executes once when a contract is created to initialize state variables
     *
     * @param _oracle - address of the specific Chainlink node that a contract makes an API call from
     * @param _jobId - specific job for :_oracle: to run; each job is unique and returns different types of data
     * @param _fee - node operator price per API call / data request
     * @param _link - LINK token address on the corresponding network
     */
    constructor(
        address _oracle,
        bytes32 _jobId,
        uint256 _fee,
        address _link
    ) {
        if (_link == address(0)) {
            setPublicChainlinkToken();
        } else {
            setChainlinkToken(_link);
        }
        setChainlinkOracle(_oracle);
        jobId = _jobId;
        fee = _fee;
    }

    /**
     * @notice Creates a Chainlink request to retrieve flight information.
     *
     * @return requestId - id of the request
     */
    function requestFlightData(string calldata _flightCode, string calldata _isoDate) public returns (bytes32 requestId) {
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );

        // Set the flight and date values
        request.add(
            "flight",
            _flightCode
        );
        request.add(
            "date",
            _isoDate
        );

        console.log("\tFlightDataConsumer.requestFlightData");

        // Sends the request
        return sendChainlinkRequest(request, fee);
    }

    /**
     * @notice Receives the response as multiple items.
     *
     * @param _requestId        - id of the request
     * @param _status           - response; status of the flight
     * @param _airport          - response; landing airport (scheduled or actual)
     * @param _scheduledArrival - response; scheduled arrival time (ISO format)
     * @param _actualArrival    - response; actual arrival time (optional, ISO format)
     */
    function fulfill(
        bytes32 _requestId,
        string calldata _status,
        string calldata _airport,
        string calldata _scheduledArrival,
        string calldata _actualArrival)
    public
    recordChainlinkFulfillment(_requestId)
    {
        console.log("\tFlightDataConsumer.fulfill");

        // emit event
        emit DataFulfilled(_status, _airport, _scheduledArrival, _actualArrival);

        // ...and set public variables
        flightStatus = _status;
        arrivalAirport = _airport;
        scheduledArrivalTime = _scheduledArrival;
        actualArrivalTime = _actualArrival;
    }

    /**
     * @notice Withdraws all LINK from the contract
     * @dev Implement a withdraw function to avoid locking your LINK in the contract
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());

        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    }

    /**
     * @notice Withdraws ETH from the contract
     * @dev Implement a withdraw function to avoid locking your ETH in the contract
     */
    function withdrawEth() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    /**
     * @notice Receive ETH in the contract
     * @dev See https://docs.soliditylang.org/en/v0.8.5/contracts.html#receive-ether-function
     */
    receive() external payable {}

    /**
    * @return contract balance
    */
    function balance() external view returns (uint) {
        return address(this).balance;
    }

    /**
     * @notice Change the job id to use
     * @dev Can be used for maintenance updates.
     */
    function setJobId(bytes32 _jobId) public onlyOwner {
        jobId = _jobId;
    }
}