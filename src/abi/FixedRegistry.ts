import * as ethers from 'ethers'
import {LogEvent, Func, ContractBase} from './abi.support'
import {ABI_JSON} from './FixedRegistry.abi'

export const abi = new ethers.utils.Interface(ABI_JSON);

export const events = {
    NewOwner: new LogEvent<([node: string, label: string, owner: ethers.BigNumber] & {node: string, label: string, owner: ethers.BigNumber})>(
        abi, '0x8fc79d5038a79402f477baedb04cbdd7665d9b7ddbf9e26d7e7a1d5fdd54c97e'
    ),
    NewResolver: new LogEvent<([node: string, resolver: ethers.BigNumber] & {node: string, resolver: ethers.BigNumber})>(
        abi, '0x405586aefbef4f47729a515c236752cb28fa42fe7c3eba6b8e1d7e9984cd7ef9'
    ),
    Transfer: new LogEvent<([node: string, owner: ethers.BigNumber] & {node: string, owner: ethers.BigNumber})>(
        abi, '0xd6b8994330811aec2a4ca50915b6afc26758aa7933a94f65ea7e4ee74de73235'
    ),
}

export class Contract extends ContractBase {
}
