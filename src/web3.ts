import {Web3} from 'web3'
import {TronWeb} from 'tronweb';
import dotenv from "dotenv"
import { EthereumNetworkInterface, Network, Web3response } from './interface/interface.js';

dotenv.config()
export const tronPrivatekey = process.env.tronPrivateKey
export const ethereumPrivatekey = process.env.ethereumPrivatekey

const fullTronNode = 'https://rpc.trongrid.io'; 
const solidityNode = 'https://tron-solidity-rpc.publicnode.com'




const networks  : Network = {
    '56': 'https://bsc-dataseed1.binance.org/',
    '204': 'https://opbnb-mainnet-rpc.bnbchain.org',
    '137': 'https://polygon-rpc.com/',
    '1': 'https://cloudflare-eth.com',
}

export const InitEthereumWeb3 = async (networkId :EthereumNetworkInterface) : Promise<Web3response>   => {
    try {
        // get the current network according to the provided network id
        const currentNetwork : string = networks[`${networkId}`]

        const web3 =  new Web3(currentNetwork)
        
        if (web3) {
            console.log(`Connected to Ethereum network: ${currentNetwork}`)
            return { success : true , response : web3}
        } else {
            throw new Error("Failed to connect to Ethereum network")
        }
        
    } catch (error) {
        console.error("An error occured during web3 initialization:", error)
        return {success : false , response :undefined}
        
    }


}


export const InitTronWe3 = ()=> {
    try {
        const tronWeb = new TronWeb({fullNode :fullTronNode,solidityNode : solidityNode, privateKey :  tronPrivatekey, });

        if (tronWeb) {
            console.log("Connected to Tron network")
            return { success : true , response : tronWeb}
        } else {
            throw new Error("Failed to connect to Tron network")
        }

    } catch (error) {
        console.error(error)
        return {success : false , response : error}
        
    }
}