const { expect } = require('chai');
const { ethers } = require('hardhat');



const tokens = (n) => {

	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('  Token Tests \n', () => {
	let token
	let accounts
	let deployer, receiver, exchange

	beforeEach(async () => {
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('Dapp University', 'DAPP', '1000000')

		accounts = await ethers.getSigners()
		deployer = accounts[0]
		receiver = accounts[1]
		exchange = accounts[2]
	})

	describe('Token Deployment', () => {
		const name = 'Dapp University'
		const symbol = 'DAPP'
		const decimals = "18"
		const totalSupply = tokens('1000000')

		it('blockchain has correct name', async () => {
			expect(await token.name()).to.equal(name)
			//console.log( "Testing Nane: " + await token.name() )
		})

		it('blockchain has correct symbol', async () => {
			expect(await token.symbol()).to.equal(symbol)
			//console.log( "Testing Symbol: " + await token.symbol() )
		})

		it('blockchain has correct decimals', async () => {
			expect(await token.decimals()).to.equal(decimals)
			//console.log( "Testing Decimals: " + await token.decimals() )
		})

		it('blockchain has correct total supply', async () => {
			expect(await token.totalSupply()).to.equal(totalSupply)
			//console.log( "Testing Total Supply: " + await token.totalSupply() )
		})

		it('assign total supply to deployer\n\n', async () => {
			expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
			//console.log( "Testing Total Supply Assigned to Deployer: " + await token.totalSupply() )
		})
		
	})

	describe('Token Transfers', () => {
		let amount, transaction,results 

		describe('Success',() => {

			beforeEach(async () => {
				amount = tokens(100)
				transaction = await token.connect(deployer).transfer(receiver.address, amount)
				result = await transaction.wait()
			})

			it('transfer tokens from deployer to receiver',async () => {
				expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
				expect(await token.balanceOf(receiver.address)).to.equal(amount)
			})

			it('emits a transfer event',async () => {
				const eventLog = result.events[0]
				const args = eventLog.args
				
				expect(eventLog.event).to.equal('Transfer')
				expect(args.from).to.equal(deployer.address)
				expect(args.to).to.equal(receiver.address)
				expect(args.value).to.equal(amount)
			})
	 	})

		describe('Failure', () => {

			it('rejects insufficient balances', async () => {
				const invalidAmount = tokens(100000000)
				await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
			})

			it('rejects invalid recipent \n\n', async () => {
				const amount = tokens(100)
				await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
			})												  

		})


	})	
	
	describe('Token Approvals', () => {
		let amount, transaction, result
		describe('Success',  () => {
			
			beforeEach( async () => {
			amount = tokens(100)
			transaction = await token.connect(deployer).approve(exchange.address, amount)
			result = await transaction.wait()
			//console.log(result.events[0].args)
			})
			
			it('allocates an allowance for delegated token spending', async () => {
				expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
			})

			it('emits a allowance event',async () => {
				const event = result.events[0]
				const args = event.args
				//console.log(args)
				expect(args.owner).to.equal(deployer.address)
				expect(args.spender).to.equal(exchange.address)
				expect(args.value).to.equal(amount)
			})
			
		})
		
		describe('Failure', () => {
			it('reject invalid spenders \n\n', async () => {
				const amount = tokens(100)
				await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
				})
			
		})
		
	})

	describe('Token Delegations and Transfers', () => {
		let amount, transaction, result
		
		beforeEach( async () => {
				amount = tokens(100)
				transaction = await token.connect(deployer).approve(exchange.address, amount)
				result = await transaction.wait()
			})

		describe('Success', () => {
			beforeEach(async () => {
				transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount)
				result = await transaction.wait()
			})
			
			it('transfers token balances', async () =>{
				expect(await token.balanceOf(deployer.address)).to.equal(ethers.utils.parseUnits('999900', 'ether'))
				expect(await token.balanceOf(receiver.address)).to.equal(amount)
			})
			
			it('resets the allowance', async () => {
				expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0)

			})
			
			it('emits allowance spending event',async () => {
				const event = result.events[0]
				const args = event.args
				//console.log(args)
				expect(args.from).to.equal(deployer.address)
				expect(args.to).to.equal(receiver.address)
				expect(args.value).to.equal(amount)
			})	


		})
		
		describe('Failure', () => {

			it('reject invalid spenders', async () => {
				const amount = tokens(100)
				await expect(token.connect(deployer).transferFrom('0x0000000000000000000000000000000000000000', receiver.address, amount)).to.be.reverted
				})

			it('reject over allowance spender', async () => {
				const invalidAmount = tokens(1000000)
				await expect(token.connect(deployer).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
				})
			
		})
		
	})

})
