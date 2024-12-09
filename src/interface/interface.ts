import {Web3} from "web3";

export interface Network {
    "56" : string,
    "204": string,
    "137": string,
    "1": string,
}

export interface WithDrawRequestInterface {
    user_id : string,
    amount_usd : number,
    address : string,
    user_balance_usd : number,
    network_data : {
        network_id : EthereumNetworkInterface
        network_name ? : "ethereum" | "tron",
    }



    user_balance_after_transfer : number,



    transaction_id? : string,
    init_transaction_id? : string,
    
    request_id? : string,
    hash? : string,
    status? : "success" | "failed",
    time? : number,

}

export type EthereumNetworkInterface =  "56" | "204" | "137" | "1";


export interface Web3response {
    success : boolean,
    response : Web3 | undefined,
}

