import { useEffect } from 'react';
import { useSelector, useDispatch} from 'react-redux';
import config from '../config.json';
import { loadProvider,
		 loadNetwork,
		 loadAccount,
		 loadTokens,
		 loadExchange
		} from '../store/interactions';


function App() {
  	const dispatch = useDispatch()

const loadBlockchainData = async () => {
  	
  	
	// Connect Ethers to blockchain
	const provider = loadProvider(dispatch)

	// Fetch current network's chainId ( hardhat: 31337, kovan: 47)
	const chainId = await loadNetwork(provider, dispatch)

	// Fetch current account and balance from Metamask
	await loadAccount(provider, dispatch)
		
	// pull from config file > Token Smart Contract Exchange 
	const DApp = config[chainId].DApp
	const mETH = config[chainId].mETH
	
	//  load Token pairs
	await loadTokens(provider, [DApp.address, mETH.address], dispatch)
	
	//	pull Exchange.address from config.json then loadExchain into state
	const exchange = config[chainId].exchange
	await loadExchange(provider, exchange.address ,dispatch)
}

//load Blockchain data
useEffect(() => {
  loadBlockchainData()
})

  return (
    <div>  

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;

