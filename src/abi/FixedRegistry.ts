import * as ethers from 'ethers'
import {LogEvent, Func, ContractBase} from './abi.support'
import {ABI_JSON} from './FixedRegistry.abi'

export const abi = new ethers.utils.Interface(ABI_JSON);

export const events = {
    NewOwner: new LogEvent<([node: string, label: string, owner: ethers.BigNumber] & {node: string, label: string, owner: ethers.BigNumber})>(
        abi, '0x8fc79d5038a79402f477baedb04cbdd7665d9b7ddbf9e26d7e7a1d5fdd54c97e'
    ),
}

export class Contract extends ContractBase {
}
