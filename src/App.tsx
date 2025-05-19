import './App.css'
// @ts-ignore
import {TonConnectButton, useTonConnectUI} from "@tonconnect/ui-react";
import { useMainContract } from "./hooks/useMainContract.ts";
import {useTonconnect} from "./hooks/useTonconnect.ts";

//kQC6XhzNRz9z8SarjGjeT4SYsj8sTudDAghs1EpgBgm2svQP

function App() {
    const {
        contract_address,
        contract_balance,
        counter_value,
        sendIncrement,
        sendDeposit,
        withdraw,
    } = useMainContract()

    const { connected } = useTonconnect()

  return (
    <div className="App">
        <div className="content">
            <div>
                <TonConnectButton />
            </div>
            <div>
                <div className='Card'>
                    <b>Our contract Address</b>
                    <div className='Hint'>{contract_address?.slice(0, 30) + "..."}</div>
                    <b>Our contract Balance</b>
                    <div className='Hint'>{contract_balance}</div>
                </div>

                <div className='Card'>
                    <b>Counter Value</b>
                    <div>{counter_value ?? "Loading..."}</div>
                </div>
            </div>

            {connected && (
                <a onClick={() => {
                    void sendIncrement()
                }}>
                    Increment by 5
                </a>
            )}

            <br/>

            {connected && (
                <a onClick={() => {
                    void sendDeposit()
                }}>
                    Send 0.05 TON to account
                </a>
            )}

            <br/>

            {connected && (
                <a onClick={() => {
                    void withdraw()
                }}>
                    Withdraw 0.1 TON
                </a>
            )}
        </div>
    </div>
  )
}

export default App
