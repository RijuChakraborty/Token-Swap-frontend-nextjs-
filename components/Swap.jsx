import { useWeb3Contract } from "react-moralis"
import contractAbi from "../constants/TokenSwap.json"
import tokenAbi from "../constants/RockToken.json"
import contractAddresss from "../constants/contractAddresses.json"
import tokenAddress from "../constants/tokenAddress.json"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import {ethers} from "ethers"
import { useNotification } from "web3uikit"

export default function Swap(){
    const {chainId: chainIdHex, isWeb3Enabled, account}= useMoralis()
    const chainId= parseInt(chainIdHex)
    const tokenSwapAddress= chainId in contractAddresss ? contractAddresss[chainId][0]: null
    const rckAddress= chainId in tokenAddress ? tokenAddress[chainId][0]: null
    console.log(tokenSwapAddress)
    console.log(account)
    const [userTokenBalance, setUserTokenBalance]= useState("0")
    const [buyTokenAmt, setBuyTokenAmt]= useState("")
    const [sellTokenAmt, setSellTokenAmt]= useState("")
    // const [allowed, setAllowed]= useState("0")
    let buyTokenAmtCorrected= ethers.utils.parseEther(buyTokenAmt || "0")
    let sellTokenAmtCorrected= ethers.utils.parseEther(sellTokenAmt || "0")

    const dispatch= useNotification()

    const {runContractFunction: balanceOf}= useWeb3Contract({
        abi: tokenAbi,
        contractAddress: rckAddress,
        functionName: "balanceOf",
        params: {
            account: account
        }
    })

    const {runContractFunction: buyToken}= useWeb3Contract({
        abi: contractAbi,
        contractAddress: tokenSwapAddress,
        functionName: "buyToken",
        params: {},
        msgValue: buyTokenAmtCorrected/100,     //user input
    })

    const {runContractFunction: approve}= useWeb3Contract({
        abi: tokenAbi,
        contractAddress: rckAddress,
        functionName: "approve",
        params:{
            spender: tokenSwapAddress,
            amount: sellTokenAmtCorrected,
        }
    })

    const {runContractFunction: sellToken}= useWeb3Contract({
        abi: contractAbi,
        contractAddress: tokenSwapAddress,
        functionName: "sellToken",
        params: {
            _amount: sellTokenAmtCorrected   //user input
        }
    })

    // const {runContractFunction: allowance}= useWeb3Contract({
    //     abi: tokenAbi,
    //     contractAddress: rckAddress,
    //     functionName: "allowance",
    //     params:{
    //         owner: account,
    //         spender: tokenSwapAddress,
    //     }
    // })

    async function updateUI(){
        const userTokensFromCall= (await balanceOf()).toString()
        setUserTokenBalance (userTokensFromCall)

        // const spendAllowed= (await allowance()).toString()
        // setAllowed (spendAllowed)
    }

    useEffect(()=>{
        if(isWeb3Enabled){
            updateUI()
        }
    },[isWeb3Enabled])

    const handleSuccess= async function(tx){
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification= function(){
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell"
        })
    }

    return(
        <div class="box">
  
            <div>User Balance: {ethers.utils.formatUnits(userTokenBalance, "ether")} RCK</div>
            {/* <div>Allowance: {ethers.utils.formatUnits(allowed, "ether")}</div> */}
            {/* <button
                onClick={
                    async function(){
                        await approve()
                    }
                }
            >Allow</button> */}
            <div class="subbox">
                <div>Buy Tokens</div>
                <label for="BuyAmt">Amount: </label>
                <input
                    type="number"
                    value={buyTokenAmt}
                    onChange={(e)=> setBuyTokenAmt(e.target.value)}
                    id="buyAmt" 
                    class="quantity"
                ></input>
                <button 
                    id="buyButton" 
                    class="subButton"
                    onClick={
                        async function(){
                            await buyToken({
                                onSuccess: handleSuccess,
                                onError: (error)=> console.log(error),
                            })
                        }}
                >Buy</button>
            </div>
            <div class="subbox">
                <div>Sell Tokens</div>
                <label for="SellAmt">Amount: </label>
                <input 
                    type="number"
                    value={sellTokenAmt}
                    onChange={(e)=> setSellTokenAmt(e.target.value)}
                    id="sellAmt" 
                    class="quantity"
                ></input>
                <button 
                    id="sellButton" 
                    class="subButton"
                    onClick={async function(){
                        await approve()
                        await sellToken({
                            onSuccess: handleSuccess,
                            onError: (error)=> console.log(error),
                        })
                    }}
                >Sell</button>
            </div>
        </div>
    )
}