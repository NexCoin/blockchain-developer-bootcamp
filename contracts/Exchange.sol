//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Exchange {

	//Deposit

	//Withdraw

	//Check Balances

	//Make Orders

	//Cancel Orders

	//Fill Orders

	//Charge Fees

	address public feeAccount;
	uint256 public feePercent;
	constructor(address _feeAccount, uint256 _feePercent) {
		//Track Fee Account
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}
	

}