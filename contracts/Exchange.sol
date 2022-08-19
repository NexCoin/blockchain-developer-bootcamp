//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
	address public feeAccount;
	uint256 public feePercent;
	mapping(address => mapping(address => uint256)) public tokens;
	mapping(uint256 => _Order) public Orders;
	uint256 public orderCount;

	event Deposit(address token, address user, uint256 amount, uint256 balance);
	event Withdrawal(address token, address user, uint256 amount, uint256 balance); 
	event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp); 

	struct _Order {
		uint256 id;
		address user;
		address tokenGet;
		uint256 amountGet;
		address tokenGive;
		uint256 amountGive;
		uint256 timestamp;
	}

	constructor(address _feeAccount, uint256 _feePercent) {
		//Track Fee Account
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}
	
	//----------------------------------------------------
	// DEPOSIT &  WITHDRAW  TOKENS


	//Deposit Token
	function depositToken(address _token, uint256 _amount) public {
		//Transfer tokens to exchange	
		require(Token(_token).transferFrom(msg.sender, address(this), _amount));
		//Update user balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
		//Emit event
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	//Withdraw Token
	function withdrawToken(address _token, uint256 _amount) public {
		//Transfer tokens from exchange
		require(Token(_token).transfer(msg.sender, _amount));
		//update user balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
		//emit event
		emit Withdrawal(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	
	//Check Balances
	function balanceOf(address _token, address _user)
		public
		view
		returns(uint256)
	{
		return tokens[_token][_user]; 
	}	

	//-------------------------------------------------
	// MAKE - CANCEL - FILL - ORDERS


	//Make Orders
	function makeOrder(address _tokenGet, uint _amountGet, address _tokenGive, uint256 _amountGive) public {
		require(_amountGive <= balanceOf(_tokenGive, msg.sender));

		orderCount++;

		Orders[orderCount] = _Order(
			orderCount,
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp
			);
		emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);

	}

	// function cancelOrder(something, and_something, SomethingElse) public {



	// }

	// function fillOrder(something, and_something, SomethingElse) public {



	// }

} // END Contract Exchange Block




//Withdraw

	
	//Make Orders

	//Cancel Orders

	//Fill Orders

	//Charge Fees