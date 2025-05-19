// @ts-ignore
// todo
import {Address, beginCell, Cell, Contract, contractAddress, ContractProvider, type Sender, SendMode} from "@ton/core"


export type MainContractConfig = {
    number: number
    address: Address
    owner_address: Address
}

export function mainContractConfigToCell(config: MainContractConfig): Cell {
    return beginCell()
        .storeUint(config.number, 32)
        .storeAddress(config.address)
        .storeAddress(config.owner_address)
        .endCell();
}

export class MainContract implements Contract {
    readonly init?: { code: Cell, data: Cell };

    // @ts-ignore
    readonly address: Address;

    constructor(
        // @ts-ignore
        readonly address: Address,

        // @ts-ignore
        readonly init?: { code: Cell, data: Cell }
    ) {
    }

    static async createFromConfig(
        config: MainContractConfig,
        code: Cell,
        workchain = 0
    ) {
        const data = mainContractConfigToCell(config)
        const init = { code, data }
        const address = contractAddress(workchain, init)

        return new MainContract(address, init)
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell()
        })
    }

    async sendInternal(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        increment_by: number,
    ) {
        const msg_body = beginCell()
            .storeUint(1, 32) //OP CODE
            .storeUint(increment_by, 32).endCell()

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body
        })
    }

    async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
        const msg_body = beginCell()
            .storeUint(2, 32) //OP Code
            .endCell()

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body
        })
    }

    async sendNoCodeDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
        const msg_body = beginCell().endCell()

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body
        })
    }

    async sendWithdrawalRequest(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        amount: bigint
    ) {
        const msg_body = beginCell()
            .storeUint(3, 32)
            .storeCoins(amount)
            .endCell()

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body
        })
    }

    async getData(provider: ContractProvider) {
        const { stack } = await provider.get('get_the_latest_sender', [])
        return {
            number: stack.readNumber(),
            recent_sender: stack.readAddress(),
            owner_address: stack.readAddress(),
        }
    }

    async getBalance(provider: ContractProvider) {
        const { stack } = await provider.get("balance", [])
        return {
            balance: stack.readNumber()
        }
    }
}