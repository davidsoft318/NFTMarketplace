import React, { Component } from "react";
import { EthAddress, Blockie } from 'rimble-ui';
import Web3 from "web3";
import getWeb3, { getGanacheWeb3} from "./getWeb3.js";
import { zeppelinSolidityHotLoaderOptions } from '../../config/webpack';
export default class Web3Info extends Component {
    state = {web3: null, accounts: null, contracts: null, isMetaMask: null, balance: null, networkId: null};
    
componentDidMount = async () => {
   try{
  const web3 = await getWeb3();
  let BasicNFT = {}
  BasicNFT = require("../../../../build/contracts/BasicNFT.json");
  const accounts = await web3.eth.getAccounts();
  const isMetaMask = web3.currentProvider.isMetaMask;
  const networkId = await web3.eth.net.getId();

  const deployedNetwork = BasicNFT.networks[networkId];

  const instance = new web3.eth.Contract(BasicNFT.abi, deployedNetwork && deployedNetwork.address);
  let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
  balance = web3.utils.fromWei(balance, 'ether');  
  this.setState({web3, accounts: accounts, contract: instance,isMetaMask: isMetaMask,balance: balance, networkId: networkId});
   }
   catch(error){
  alert('Failed to load web3, accounts and contract, check the console');
  console.error(error);
   }
};

    componentWillUnmount() {
        if (this.interval) {
          clearInterval(this.interval);
        }
    }

    refreshValues = (instanceBasicNFT) => {
        if (instanceBasicNFT) {
          console.log('refreshValues of iinstanceBasicNFT');
        }
    }


  render()  {
    
    return (
      <div >
        <h3> Your Web3 Info </h3>
        <div>
          <div >
            Network:
          </div>
          <div >
            {this.state.networkId}
          </div>
        </div>
        <div >
          <div >
            Your address:
          </div>
          <div >
            <EthAddress address = {this.state.accounts}/>
            <Blockie
              opts={{seed: this.state.accounts, size: 15, scale: 3}} />
          </div>
        </div>
        <div >
          <div >
            Your ETH balance:
          </div>
          <div >
          {this.state.balance}
          </div>
        </div>
        <div >
          <div >
            Using Metamask:
          </div>
          <div >
            {this.state.isMetaMask ? 'YES' : 'NO'}
          </div>
        </div>
      </div>
    );
  }
}