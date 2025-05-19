import { useEffect, useState } from "react";
import { MainContract } from "../contracts/MainContract.ts";
import { useTonClient } from "./useTonClient.ts";
import { useAsyncInitialize } from "./useAsyncInitialize.ts";
// @ts-ignore
import { Address, OpenedContract } from "@ton/core";
import { toNano } from '@ton/core'
import { useTonconnect} from "./useTonconnect.ts";

export const useMainContract = () => {
    const client = useTonClient()
    const { sender } = useTonconnect()

    const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time))

    const [contractData, setContractData] = useState<null | {
        counter_value: number
        recent_sender: Address
        owner_address: Address
    }>();

    const [balance, setBalance] = useState<null | number>(0)

    const mainContract = useAsyncInitialize(async () => {
        if (!client) return
        const contract = new MainContract(Address.parse("kQC6XhzNRz9z8SarjGjeT4SYsj8sTudDAghs1EpgBgm2svQP"))
        console.log(contract.address)
        return client.open(contract) as OpenedContract<MainContract>
    }, [client])

    useEffect(() => {
        async function getValue() {
            if (!mainContract) return
            setContractData(null)
            const val = await mainContract.getData()
            const balance = await mainContract.getBalance()
            setContractData({
                counter_value: val.number,
                recent_sender: val.recent_sender,
                owner_address: val.owner_address
            })

            setBalance(balance.balance)
            await sleep(5000)
            void getValue()
        }
        void getValue()
    }, [mainContract]);

    return {
        contract_address: mainContract?.address.toString(),
        contract_balance: balance,
        ...contractData,
        sendIncrement: async () => {
            return mainContract?.sendInternal(sender, toNano("0.05"), 5)
        },
        sendDeposit: async () => {
            return mainContract?.sendDeposit(sender, toNano("0.05"))
        },
        withdraw: async () => {
            return mainContract?.sendWithdrawalRequest(sender, toNano("0.05"), toNano("0.1"))
        }
    }
}