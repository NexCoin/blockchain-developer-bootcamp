const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {

	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('  Exchange Tests \n', () => {
	let deployer, feeAccount, exchange

	const feePercent = 10

	beforeEach(async () => {
		const Exchange = await ethers.getContractFactory('Exchange')
		const Token = await ethers.getContractFactory('Token')

		token1 = await Token.deploy('Dapp University', 'DAPP', '1000000')
		token2 = await Token.deploy('Mycoin', 'MYC', '1000000')

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]
		user1 = accounts[2]
		user2 = accounts[3]


		let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))
		exchange = await Exchange.deploy(feeAccount.address, feePercent)

	})

	describe('Exchange Deployment', () => {
		

		it('track the fee account', async () => {
			expect(await exchange.feeAccount()).to.equal(feeAccount.address)
			//console.log( "Testing feeAccount: " + await exchange.feeAccount() )
		})

		it('track fee percentage', async () => {
			expect(await exchange.feePercent()).to.equal(feePercent)
			//console.log( "Testing feePercent: " + await exchange.feePercent() )
		})

	})

	describe('Depositing Tokens', () => {
			let transaction, result
			let amount = tokens(10) 

		describe('Success', () => {

			beforeEach(async () => {
			// approve transaction
			//console.log(user1.address, exchange.address, amount.toString())
			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = await transaction.wait()
			// deposit tokens
			transaction = await exchange.connect(user1).depositToken(token1.address, amount)
			result = await transaction.wait()
			//console.log("result:  " + result)
			})

			it('tracks the token deposit', async () => {
				expect(await token1.balanceOf(exchange.address)).to.equal(amount)
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)	
			})

			it('emits a deposit event', async () => {
				const event = result.events[1]
				expect(event.event).to.equal('Deposit')

				const args = event.args
				expect(args.token).to.equal(token1.address)
				expect(args.user).to.equal(user1.address)
				expect(args.amount).to.equal(amount)
				expect(args.balance).to.equal(amount)
									
			})

		})	

		describe('Failure', () => {
			it('fails when no tokens are approved', async () => {
				await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
			})


		})
	})


	describe('Withdrawing Tokens', () => {
			let transaction, result
			let amount = tokens(10) 

		describe('Success', () => {

			beforeEach(async () => {
				// approve transaction
				//console.log(user1.address, exchange.address, amount.toString())
				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = await transaction.wait()
				// deposit tokens
				transaction = await exchange.connect(user1).depositToken(token1.address, amount)
				result = await transaction.wait()
				//console.log("result:  " + result)

				//Now withdraw Tokens - test
				transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
				result = await transaction.wait()
			})

			it('tracks the token withdrawal', async () => {
				expect(await token1.balanceOf(exchange.address)).to.equal(0)
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)	
			})

			it('emits a withdrawal event', async () => {
			 	const event = result.events[1]
			 	expect(event.event).to.equal('Withdrawal')

			 	const args = event.args
			 	expect(args.token).to.equal(token1.address)
			 	expect(args.user).to.equal(user1.address)
			 	expect(args.amount).to.equal(amount)
			 	expect(args.balance).to.equal(0)
									
			 })

		})	

		describe('Failure', () => {
			it('fails if exchange has gone broke', async () => {
			await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
			})
		})

	})

	describe('Checking Balances', () => {
		let transaction, result
		let amount = tokens(1)

		beforeEach(async () => {
			// Approve Tokens
			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = await transaction.wait()
			// Deposit Tokens
			transaction = await exchange.connect(user1).depositToken(token1.address, amount)
			result = await transaction.wait()
		})

		it('returns user balance', async () => {
			expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
		})	

	})

	describe('Make Order', () => {
		let transaction, result
		//let tokenGet, amountGet, tokenGive, amountGive
		let amount = tokens(10)
		describe('Succss', async () => {
			beforeEach(async () => {
				// Deposit tokens before making order

				// Approve Tokens
				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = await transaction.wait()
				// Deposit Tokens
				transaction = await exchange.connect(user1).depositToken(token1.address, amount)
				result = await transaction.wait()

				// Make Order
				transaction = await exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))
				result = await transaction.wait()
			})

			it('Tracks new created order', async () => {
			expect(await exchange.orderCount()).to.equal(1)
			})

			it('emits a Make Order event', async () => {
			 	const event = result.events[0]
			 	expect(event.event).to.equal('Order')

			 	const args = event.args
			 	// console.log(args)  -> to actually see the event.args values 
			 	expect(args.id).to.equal(1)
			 	expect(args.user).to.equal(user1.address)
			 	expect(args.tokenGet).to.equal(token2.address)
			 	expect(args.amountGet).to.equal(tokens(1))
			 	expect(args.tokenGive).to.equal(token1.address)
				expect(args.amountGive).to.equal(tokens(1))
				expect(args.timestamp).to.at.least(1)
			 })
		})

		describe('Failure', async () => {
				
			it('fail when order is more tokens then in account', async () => {
			await expect(exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))).to.be.reverted
			})
		})
	})

	describe('Order actions', async () => {
		let transaction, result
		let amount = tokens(1)

		beforeEach(async () => {
			// Approve and Deposit tokens before making order
			// Approve Tokens
			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = await transaction.wait()
			
			// Deposit Tokens
			transaction = await exchange.connect(user1).depositToken(token1.address, amount)
			result = await transaction.wait()

			// Give Tokens to user2
		 	transaction = await token2.connect(deployer).transfer(user2.address, tokens(100))
		 	result = await transaction.wait()
			
			// approve Um.. Deposits tokens spend for exchange
			transaction = await token2.connect(user2).approve(exchange.address, tokens(2))
			result = await transaction.wait()
			
			// user2 deposits tokens
			transaction = await exchange.connect(user2).depositToken(token2.address, tokens(2))
			result = await transaction.wait()
			
			// Make Order
			transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)
			result = await transaction.wait()
		}) 

		describe('Cancelling orders', async () => {

			describe('Success', async () => {
				beforeEach(async () => {
					transaction = await exchange.connect(user1).cancelOrder(1)
					result = await transaction.wait()
				})

				it('updates cancelled orders', async () => {
					expect(await exchange.orderCancelled(1)).to.equal(true)
				})

				it('emits a Cancel event', async () => {
			 	const event = result.events[0]
			 	expect(event.event).to.equal('Cancel')

			 	const args = event.args
			 	//console.log(args) // -> to actually see the event.args values
			 	expect(args.id).to.equal(1)
			 	expect(args.user).to.equal(user1.address)
			 	expect(args.tokenGet).to.equal(token2.address)
			 	expect(args.amountGet).to.equal(tokens(1))
			 	expect(args.tokenGive).to.equal(token1.address)
				expect(args.amountGive).to.equal(tokens(1))
				expect(args.timestamp).to.at.least(1)
			 	})
			}) // Success

			describe('Failures', async () => {
					beforeEach(async () => {
					//console.log(user1.address, user2.address)
					// // Approve and Deposit tokens before making order
					// // Approve Tokens
					transaction = await token1.connect(user1).approve(exchange.address, amount)
					result = await transaction.wait()
					// // Deposit Tokens
					transaction = await exchange.connect(user1).depositToken(token1.address, amount)
					result = await transaction.wait()

					// // Make Order
					transaction = await exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))
					result = await transaction.wait()
				})
				
				it('revert if invalid order id', async () => {
					const invalidOrderId = 99999
				 	await expect(exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted
				})

				it('revert if invalid user id', async () => {	
				 	await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted
				})
			})  // Failures
		})
		//---------------------------------------------
		//  FILL THE ORDERS    EXECUTE TRADE
		//			TEST  TEST  TEST
		//----------------------------------------------

		describe('Fill Orders', async ()  => {
			
			

			describe('Success',async () =>  {
			
			beforeEach(async () => {
			// execute fill the order
			transaction = await exchange.connect(user2).fillOrder('1')
			result = await transaction.wait()
			})

			it('execute trade - user1 gave user2 1 DAPP Token', async () => {
				// Token Give
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokens(0))
			})	
			
			it('execute trade user2 gave user1 1 SomeThing Token', async () => {
				expect(await exchange.balanceOf(token2.address, user2.address)).to.equal(tokens(.9))
			})
			
			it('execute trade and user2 was charged 10% trading fees', async () => {
				expect(await exchange.balanceOf(token1.address, feeAccount.address)).to.equal(tokens(0))
			})

			it('the trade did take place', async () => {
				expect(await exchange.balanceOf(token2.address, user1.address)).to.equal(tokens(1))
				expect(await exchange.balanceOf(token1.address, user2.address)).to.equal(tokens(1))
			})
			
			it('the exchange charged fee and made money', async () => {
				expect(await exchange.balanceOf(token2.address, feeAccount.address)).to.equal(tokens(.1))
			})

			it('check if filled orders are logged', async () => {
					expect(await exchange.orderFilled(1)).to.equal(true)
			})

			it('emits a trade event', async () => {
				const event = result.events[0]
				expect (event.event).to.equal('Trade')

				const args = event.args
				expect(args.id).to.equal(1)
				expect(args.user).to.equal(user2.address)
				expect(args.tokenGet).to.equal(token2.address)
				expect(args.amountGet).to.equal(tokens(1))
				expect(args.tokenGive).to.equal(token1.address)
				expect(args.amountGive).to.equal(tokens(1))
				expect(args.creator).to.equal(user1.address)
				expect(args.timestamp).to.at.least(1)
			})

			}) //Success


			describe('Failures',async () =>  {

				it('revert if order does not exist', async () => {
					const invalidOrderId = 99999
					await expect(exchange.connect(user2).fillOrder(invalidOrderId)).to.be.reverted
					//expect(await exchange.orderCount()).to.equal(1)
					// console.log( "Testing feeAccount: " + await exchange.feeAccount() )
					// console.log( "Testing orderCount: " + await exchange.orderCount() )
					//console.log( "Testing order 0  =  orderCancelled: " + await exchange.orderCancelled(0) )
					//console.log( "Testing order 1  =  orderCancelled: " + await exchange.orderCancelled(1) )
					// console.log( "Testing orderFilled 0  =  : " + await exchange.orderFilled(0) )
					// 
				})

				it('revert if order has already been filled', async () => {
					transaction = await exchange.connect(user2).fillOrder('1')
					await transaction.wait()
					// console.log( "Testing orderFilled 1  =  : " + await exchange.orderFilled(1) )
					await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
				})

				it('revert if order has been cancelled', async () => {
					transaction = await exchange.connect(user1).cancelOrder(1)
					await transaction.wait()
					//exchange.connect(user1).cancelOrder(1)
					//console.log( "Testing order 0  =  orderCancelled: " + await exchange.orderCancelled(0) )
					//console.log( "Testing order 1  =  orderCancelled: " + await exchange.orderCancelled(1) )
					await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
				})
				

				it('revert if maybe either user does not have enough tokens', async () => {
					
				})

			})
		})  // Fill Orders
	})	// Order actions 
})    // END Exchange Block  //