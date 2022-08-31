const config = require('../src/config.json')

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
	const milliseconds = seconds * 1000
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
	// Fetch accounts from wallet - the unlocked ones
	const  accounts = await ethers.getSigners()

	// Fetch ah get my network
	const { chainId } = await ethers.provider.getNetwork()
	console.log("using chainId: ", chainId)

	// Fetch them tokens
	const DApp = await ethers.getContractAt('Token', config[chainId].DApp.address)
	console.log(`DApp Token fetched: ${DApp.address}\n`)

	const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
	console.log(`mETH Token fetched: ${mETH.address}\n`)

	const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
	console.log(`mDAI Token fetched: ${mDAI.address}\n`)

	// Fetch the deployed exchange
	const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
	console.log(`Exchange is fetched: ${exchange.address}\n`)

	// Give tokens to accounts
	const sender = accounts[0]
	const receiver = accounts[1]
	let amount =  tokens(10000)

	// user1 transfer 10,000 ETH
	let transaction, result
	transaction = await mETH.connect(sender).transfer(receiver.address, amount)
	console.log(`Transfered ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

	// Set up users
	const user1 = accounts[0]
	const user2 = accounts[1]
	amount = tokens(10000)

	//  user1 approves 10,000 DApp...
	transaction = await DApp.connect(user1).approve(exchange.address, amount)
	await transaction.wait()
	console.log(`Approved ${amount} tokens from ${user1.address}\n`)

	//  user1 deposits 10,000 DApp...
	transaction = await exchange.connect(user1).depositToken(DApp.address, amount)
	await transaction.wait()
	console.log(`Deposited ${amount} tokens from ${user1.address}\n`)
 
 	//  user2 approves 10,000 mETH...
	transaction = await mETH.connect(user2).approve(exchange.address, amount)
	await transaction.wait()
	console.log(`Approved ${amount} tokens from ${user2.address}\n`)

	//  user2 deposits 10,000 mETH...
	transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
	await transaction.wait()
	console.log(`Deposited ${amount} tokens from ${user2.address}\n`)

	////////////////////////////////////////////////////////////
	//  Seed then cancle orders
	//

	// Make Order
	let orderId
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(5))
	result = await transaction.wait()
	console.log(`Make order from ${user1.address}\n`)
	
	// user1 cancels order
	orderId = result.events[0].args.id
	console.log("print this: " + orderId )
	transaction = await exchange.connect(user1).cancelOrder(orderId)
	console.log(`Cancelled order from ${user1.address}\n`)

	// Wait a second
	await wait(1)


	////////////////////////////////////////////////////////////
	//  Seed filled orders
	//
	// 

	// user1 makes order
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(10))
	result = await transaction.wait()
	console.log(`Make order from ${user1.address}\n`)

	// user2 fills order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)

	// WaiT a Second !
	await wait(1)

	// user1 makes another order
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, tokens(15))
	result = await transaction.wait()
	console.log(`Make order from ${user1.address}\n`)

	// user2 fills this above order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)

	// WaiT a Second ! No Wait a minute !!! Just Slow down !!!
	await wait(1)

	// user1 makes one last order  (must be out of money)
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), DApp.address, tokens(20))
	result = await transaction.wait()
	console.log(`Make order from ${user1.address}\n`)

	// user2 fills this above order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)

	// I said Wait!!  Ok, That's it !  |  I Quit !!
	await wait(1)


	////////////////////////////////////////////////////////////
	//  Seed open orders
	//
	// 

	// user1 makes 10 order
	for(let i=1 ; i <= 10; i++) {
	exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), DApp.address, tokens(10))
	result = await transaction.wait()

	console.log(`Made order from ${user1.address}\n`)

	// Ok I'll Wait...
	await wait(1)
	}

	// user2 makes 10 order
	for(let i=1 ; i <= 10; i++) {
	exchange.connect(user2).makeOrder(DApp.address, tokens(10), mETH.address, tokens(10 * i))
	result = await transaction.wait()

	console.log(`Made order from ${user2.address}\n`)

	// Ok I'll Wait...
	await wait(1)
	}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});