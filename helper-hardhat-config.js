const networkConfig = {
  default: {
    name: "hardhat",
    fee: "100000000000000000", // 0.1
    keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
    fundAmount: "1000000000000000000", // 0.1
  },
  31337: {
    name: "localhost",
    fee: "100000000000000000", // 0.1
    keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
    fundAmount: "1000000000000000000", // 0.1
  },
  5: {
    name: "goerli",
    linkToken: "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
    jobId: "cebdc07d02ab4efca2e8ebc736edd2b7",
    fee: "10000000000000000", // 0.01
    fundAmount: "100000000000000000", // 0.1
  },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 1

module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
}
