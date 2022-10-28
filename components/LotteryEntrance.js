import { contractAddresses, abi } from "../constants"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"

export default function LotteryEntrance() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const dispatch = useNotification()

    const [storeValue, setStoreValue] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")

    const {
        runContractFunction: store,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "store",
        msgValue: 0,
        params: {},
    })

    /* View Functions */

    const { runContractFunction: retrieve } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress, // specify the networkId
        functionName: "retrieve",
        params: {},
    })

    const { runContractFunction: showPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress, // specify the networkId
        functionName: "showPlayers",
        params: {},
    })

    async function updateUIValues() {
        const numPlayersFromCall = (await showPlayers()).toString()
        const retriveStoreValue = (await retrieve()).toString()
        setNumPlayers(numPlayersFromCall)
        setStoreValue(retriveStoreValue)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
            {raffleAddress ? (
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async () =>
                            await store({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Lottery"
                        )}
                    </button>
                    <div>store value: {storeValue} USDT</div>
                    <div>The current number of players is: {numPlayers}</div>
                </>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}
