const { expect } = require('chai');
const { ethers } = require('hardhat');



const tokens = (n) => {

	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token', () => {
	let token
	let accounts
	let deployer

	beforeEach(async () => {
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('Dapp University', 'DAPP', '1000000')

		accounts = await ethers.getSigners()
		deployer = accounts[0]
	})

	describe('Deployment', () => {
		const name = 'Dapp University'
		const symbol = 'DAPP'
		const decimals = "18"
		const totalSupply = tokens('1000000')

		it('The blockchain has correct name', async () => {
			expect(await token.name()).to.equal(name)
			console.log( "Testing " + await token.name() )
		})

		it('The blockchain has correct symbol', async () => {
			expect(await token.symbol()).to.equal(symbol)
			console.log( "Testing " + await token.symbol() )
		})

		it('The blockchain has correct decimals', async () => {
			expect(await token.decimals()).to.equal(decimals)
			console.log( "Testing " + await token.decimals() )
		})

		it('The blockchain has correct total supply', async () => {
			expect(await token.totalSupply()).to.equal(totalSupply)
			console.log( "Testing " + await token.totalSupply() )
		})

		it('Assign total supply to deployer', async () => {
			expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
			console.log( "Testing " + await token.totalSupply() )
		})
		console.log(async () => {console.log( "in await now " + (await token.name()))})
		
		//dname()
		})
	
})
