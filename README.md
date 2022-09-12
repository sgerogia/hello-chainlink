# Chainlink Flight Data Oracle

This project is an end-to-end demonstration of spinning up Chainlink nodes and creating Oracles.  
It uses a simple flight data use case as an example.

## Requirements

* Docker Desktop
* kubectl
* Helm
* Tilt
* Use Docker Desktop as the K8s environment `kubectl config use-context docker-desktop`
* Node.JS
* nvm   
* Infura API key
* Etherscan API key

## Getting started

```bash
nvm install 18.7.0
nvm use 18.7.0
node install 
npx hardhat test
```

## Detailed scenario

Follow the instructions in the [associated blog post](https://sgerogia.github.io/Chainlink-Oracle/).
