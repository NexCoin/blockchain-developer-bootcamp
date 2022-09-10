#! /bin/sh


## to start my hardhat local blockchain

exec npx hardhat node

## then deploy my Exchange and Contracts 

exec npx hardhat run --network localhost scripts/1_deploy.js

## now lets seed it with test stuff

exec npx hardhat run --network localhost scripts/2_seed-exchange.js

