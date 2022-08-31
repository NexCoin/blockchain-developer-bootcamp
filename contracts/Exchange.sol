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
	mapping(uint256 => bool) public orderCancelled;
	mapping(uint256 => bool) public orderFilled;

	event Deposit(address token, address user, uint256 amount, uint256 balance);
	event Withdrawal(address token, address user, uint256 amount, uint256 balance); 
	event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp); 
	event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
	event Trade(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address creator, uint256 timestamp);

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
		///////////////////////////////////////////////////////////////
		//Transfer tokens from exchange  Mr Dapps way of doing things
		require(tokens[_token][msg.sender] >= _amount);
		///////////////////////////////////////////////////////////////

		//   My Bad		--> this is different them his Noted above
		require(Token(_token).transfer(msg.sender, _amount));
		//------------------------------------------------------------

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

	function cancelOrder(uint256 _id) public {
		// get the requested order
		_Order storage _order = Orders[_id];
		// check if they are the owner of order
		require(address(_order.user) == msg.sender);
		// Check if order exist
		require(_order.id == _id);
		// cancel this order
		orderCancelled[_id] = true;

		emit Cancel(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, _order.timestamp);
	}

	//---------------------------------------------
	//  FILL THE ORDERS    EXECUTE TRADE

	function fillOrder(uint256 _id) public {
		
		// check if this is a valid order
		require(_id > 0 && _id <= orderCount, 'Order does Not Exist');

		// check if order has been cancelled
		require(!orderCancelled[_id]);

		// check if order has been filled
		require(!orderFilled[_id], 'Order has already been filled');

		// check that user1 has enough tokens to trade
		//require(_amountGive <= balanceOf(_tokenGive, msg.sender));


		// check if user2 has enough tokens to trade

		// get the order
		_Order storage _order = Orders[_id];


		// check that user1 has enough tokens to trade
		require(_order.amountGive <= balanceOf(_order.tokenGive, _order.user), "Order Maker does Not have Enough Tokens");
		
		// check that user2 has enough tokens to trade
		uint256 amountNeeded = balanceOf(_order.tokenGet, msg.sender);
		require(_order.amountGet <= amountNeeded, "Order Filler does Not have Enough Tokens");

		// Swapping Tokens  (Trading)
		_trade(_order.id, _order.user, _order.tokenGet,	_order.amountGet, _order.tokenGive,	_order.amountGive);

		// Mark the order as filled
		orderFilled[_order.id] = true;
	}

	  	function _trade(
		 	uint256 _orderID,
		 	address _user,
		 	address _tokenGet,
		 	uint256 _amountGet,
		 	address _tokenGive,
			 uint256 _amountGive


		)	internal {
		// Fee is paid by the user that who filled the order (msg.sender)
		// Fee is deducted from _amountGet
		uint256 _feeAmount = ( _amountGet * feePercent) / 100 ;


		// do Trade
		// msg.sender is the user who filled the order, while _user is whom created the order 
		tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - (_amountGet + _feeAmount);
		tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;

		//charge fee
		tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount;   

		tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;
		tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + _amountGive;

		// Remember msg.sender is who is filling the order - the _user is whom made the order
		emit Trade(_orderID, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, _user, block.timestamp );
	}

} // END Contract Exchange Block




	//Withdraw -- DONE

	
	//Make Orders -- DONE

	//Cancel Orders  -- DONE

	//Fill Orders

	//Charge Fees