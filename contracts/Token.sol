//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
	string public name;
	string public symbol;
	uint256 public decimals = 18;
	uint256 public totalSupply;

	// Track Balances
	mapping(address => uint256) public balanceOf;
	
	event Transfer(address indexed from, address indexed to, uint256 value);

	// Send Tokens
	constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
		name = _name;
		symbol = _symbol;
		//decimals = decimals; // = _decimals;
		totalSupply = _totalSupply * (10**decimals);
		balanceOf[msg.sender] = totalSupply;
	}

	function transfer(address _to, uint256 _value)
	public
	returns(bool success)
	{	
		//Check sender for enough to spend
		require(balanceOf[msg.sender] >= _value);
		//check for 0 address
		require(_to != address(0)); 	

		// Deduct tokens from sender
		balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
		// Credit tokens to receiver
		balanceOf[_to] = balanceOf[_to] + _value;
		emit Transfer(msg.sender, _to, _value);
		return true;
	}	
}
