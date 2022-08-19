import { ConnectButton } from "web3uikit"

export default function Header(){
    return(
        <div>  
            <h1>Rock Token Exchange</h1>
            <div class="connect">
                <ConnectButton moralisAuth={false} />
            </div>
        </div>
    )
}