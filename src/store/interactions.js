import { ethers } from 'ethers'
import TOKEN_ABI from '../abis/Token.json';

export const loadProvider = (dispatch) => {
	// Connect Ethers to blockchain
	const connection = new ethers.providers.Web3Provider(window.ethereum)
	
	// 
	//dispatch({ type: 'PROVIDER_LOAD', connection: connection })
	// Above connection : connection  => key:value   are same  so change below to
	dispatch({ type: 'PROVIDER_LOADED', connection })

	return connection
}

export const loadNetwork = async (provider, dispatch) => {
	const { chainId }  = await provider.getNetwork()
	dispatch({ type: 'NETWORK_LOADED', chainId })

	return chainId
}

export const loadAccount = async (dispatch) => {
	const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
	const account = ethers.utils.getAddress(accounts[0])

	dispatch({ type: 'ACCOUNT_LOADED', account })

	return account
}

export const loadToken = async (provider, address, dispatch)  => {
	let token, symbol
	
	token = new ethers.Contract(address, TOKEN_ABI, provider)
	symbol = await token.symbol()
	dispatch({ type: 'TOKEN_LOADED', token, symbol })

	return token
}


/*              was My way    it seemed to work
export const loadToken = (contractAddress, TOKEN_ABI, provider, dispatch)  => {
	// Load Token Smart Contract
	const token = new ethers.Contract(contractAddress, TOKEN_ABI, provider)
	dispatch({ type: 'TOKEN_LOADED', token })

	return token
}
*/