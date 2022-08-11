const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {

	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('  Exchange Tests \n', () => {
	let deployer, feeAccount, exchange

	const feePercent = 10

	beforeEach(async () => {
		
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]

		const Exchange = await ethers.getContractFactory('Exchange')
		exchange = await Exchange.deploy(feeAccount.address, feePercent)

	})

	describe('Exchange Deployment', () => {
		

		it('track the fee account', async () => {
			expect(await exchange.feeAccount()).to.equal(feeAccount.address)
			console.log( "Testing feeAccount: " + await exchange.feeAccount() )
		})

		it('track fee percentage', async () => {
			expect(await exchange.feePercent()).to.equal(feePercent)
			console.log( "Testing feePercent: " + await exchange.feePercent() )
		})
	})
})