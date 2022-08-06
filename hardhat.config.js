require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
//require("@nomicfoundation/hardhat-toolbox");


task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for(const account of accounts){
    console.log(account.address);
  }
})


// Export this object to setup my config
// Goto https://hardhat.org/config/
/*
*  @type import('hardhat/config').HardhatUserConfig
*/
module.exports = {
  solidity: "0.8.9",
  networks: {
    localhost:{}
  },
};
