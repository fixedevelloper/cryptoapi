var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Web3 } from 'web3';
import { TronWeb } from 'tronweb';
import dotenv from "dotenv";
dotenv.config();
export const tronPrivatekey = process.env.tronPrivateKey;
export const ethereumPrivatekey = process.env.ethereumPrivatekey;
const fullTronNode = 'https://rpc.trongrid.io';
const solidityNode = 'https://tron-solidity-rpc.publicnode.com';
const networks = {
    '56': 'https://bsc-dataseed1.binance.org/',
    '204': 'https://opbnb-mainnet-rpc.bnbchain.org',
    '137': 'https://polygon-rpc.com/',
    '1': 'https://cloudflare-eth.com',
};
export const InitEthereumWeb3 = (networkId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get the current network according to the provided network id
        const currentNetwork = networks[`${networkId}`];
        const web3 = new Web3(currentNetwork);
        if (web3) {
            console.log(`Connected to Ethereum network: ${currentNetwork}`);
            return { success: true, response: web3 };
        }
        else {
            throw new Error("Failed to connect to Ethereum network");
        }
    }
    catch (error) {
        console.error("An error occured during web3 initialization:", error);
        return { success: false, response: undefined };
    }
});
export const InitTronWe3 = () => {
    try {
        const tronWeb = new TronWeb({ fullNode: fullTronNode, solidityNode: solidityNode, privateKey: tronPrivatekey, });
        if (tronWeb) {
            console.log("Connected to Tron network");
            return { success: true, response: tronWeb };
        }
        else {
            throw new Error("Failed to connect to Tron network");
        }
    }
    catch (error) {
        console.error(error);
        return { success: false, response: error };
    }
};
