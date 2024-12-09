import { EthereumNetworkInterface, WithDrawRequestInterface } from "./interface/interface.js";
import { ethereumPrivatekey, InitEthereumWeb3 } from "./web3.js";
import {Web3} from "web3";
import { UsdtBscContract } from "./contracts/bsc/usdt.js";
import { UsdtEthContract } from "./contracts/eth/usdt.js";
import { UsdtPolContract } from "./contracts/pol/usdt.js";
import { UsdtOpBnbContract } from "./contracts/opBnb/usdt.js";
import logger from "./logger.js";
import {networkNames} from './enum.js'
import gun from "./config/gun.config.js";
import { generateUniqueId } from "./utils.js";
import { bytesToHex } from 'web3-utils';
import { isAddress } from "web3-validator"

const contracts = {
    "56" : UsdtBscContract,
    "204" : UsdtOpBnbContract,
    "137" : UsdtPolContract,
    "1" : UsdtEthContract,
}

export const WithDrawlsManager = async (userData : WithDrawRequestInterface): Promise<{
    success: boolean;
    response: WithDrawRequestInterface | string;
} >=>  {
    try {
        userData.request_id = generateUniqueId()
        logger.info(`Processing request id :  ${userData.request_id}`)
        let web3 : Web3 | undefined = undefined
        const hasSufficientBalance = userData.user_balance_usd >= userData.amount_usd
        
        if (!hasSufficientBalance) { 
            throw new Error("Insufficient balance")
        }
        const networkId = userData.network_data.network_id
      

        if (networkId && userData.network_data.network_name == "ethereum" ) {
           const web3Initresponse  = await InitEthereumWeb3(networkId)
           if (web3Initresponse.success ) {
               web3 = web3Initresponse.response
           } else {
            throw new Error("Failed to initialize Ethereum web3")
           }
           console.log(`Connected to Ethereum network: ${networkNames[`${networkId}`]}`)
           logger.info(`Connected to Ethereum network: ${networkNames[`${networkId}`]}`)
           const hash = await ethereumTransfer(web3!, networkId, userData.address, userData.amount_usd)
           if (hash !== null) {
            userData.hash = bytesToHex(hash.transactionHash)
            logger.info("hash : ",userData.hash)
            console.log("hash : ",userData.hash)
            userData.status = 'success'
            userData.user_balance_after_transfer = userData.user_balance_usd - userData.amount_usd
            userData.time = Date.now()
            logger.info("saving transaction to database")
            gun.get("transactions").get("success").get(userData.init_transaction_id || userData.hash).put(userData)
            logger.info("Withdrawal request processed successfully , userData : ", JSON.stringify(userData))
            return {success : true, response : userData}
           } else  {
            userData.status = 'failed'
            userData.time = Date.now()
            gun.get("transactions").get("failed").get(userData.transaction_id || userData.hash).put(userData)
            logger.info("Failed to process withdrawal request, userData : ", JSON.stringify(userData))
            throw new Error("The transaction was init but failed during the execution")
           }
        }
     

        console.log("coming soon")
        return {success : false, response : "coming sson"}

    } catch (error : any) {
        console.error(error)
        logger.error("Failed to process withdrawal request", error)
        return {success : false, response : error.message}
        
        
    }

}

const ethereumTransfer = async (web3 : Web3, networkId  : EthereumNetworkInterface,  toAddress : string, amountUsd : number) => { 

    try {
        const contract = await initContract(web3, networkId)
        if (!contract) {
            throw new Error("Failed to initialize contract")
        }

        const privateKey = ethereumPrivatekey
        if (!privateKey) {
            throw new Error("Private key is missing")
        }
        if (!isAddress(toAddress)) {
            throw new Error("Invalid address")
        }
        const account = web3.eth.accounts.privateKeyToAccount(privateKey)
        const decimals = Number( await contract.methods.decimals().call())
        const multiplier = 10**decimals
        const accountbalance =Number( await contract.methods.balanceOf(account.address).call())
        const formatedBalance = accountbalance/multiplier

        if (!decimals) {
            throw new Error("Failed to get decimals from contract")
        }
        if (formatedBalance < amountUsd) { 
            throw new Error(`Insufficient balance in the ${networkNames[`${networkId}`]} private key account`)
        }
        const transactionData = contract.methods.transfer(toAddress, amountUsd * multiplier).encodeABI()
        const estimateFees = Number(await web3.eth.estimateGas({
            to: contract.options.address,
            data: transactionData,
            from : account.address,
        }))
        logger.info(`Estimated fees for Ethereum transfer: ${estimateFees} gas`)
        const gasPrice = await web3.eth.getGasPrice()
        const gasLimit = Math.ceil(estimateFees * 1.2);
        const nonce = await web3.eth.getTransactionCount(account.address, 'latest')
        logger.info(`Gas limit for Ethereum transfer: ${gasLimit} gas`)

        const tx = {
            from: account.address,
            to: contract.options.address,
            gasPrice: gasPrice,
            gas: gasLimit,
            data: transactionData,
            value : "0" ,
            nonce: nonce,
        }
        logger.info(`Transaction data for Ethereum transfer: to : ${tx.to}, amount : ${amountUsd} USDT ${networkNames[`${networkId}`]}, gas price : ${tx.gasPrice}, gas limit : ${tx.gas}`)
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)


        if (!signedTx) {
            throw new Error("Failed to sign transaction")
        }
        logger.info("Transaction signed successfully, sending it to Ethereum network")
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        if (!receipt) {
            throw new Error("Failed to send transaction")
        }
        logger.info("Transaction sent successfully, transaction hash: ", receipt.transactionHash)
        return receipt
    } catch (error) {
        logger.error("Transfer failed :", error)
        console.log("An error occured during Ethereum transfer:", error)
        return null
        
    }
}

const initContract = async (web3 : Web3, networkId : EthereumNetworkInterface) => { 
    try {
        const contractToUse = contracts[`${networkId}`]
        console.log(` Initializing contract for network: ${networkNames[`${networkId}`]}`)
        const contract = new web3.eth.Contract(contractToUse.abi, contractToUse.address)
        if (contract) {
            return contract
        } else {
            throw new Error("Failed to initialize contract")
        }
        
    } catch (error) {
        console.error(error)
        logger.error("Failed to initialize contract", error)
        return undefined
        
    }
}