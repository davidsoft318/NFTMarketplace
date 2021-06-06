import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "../utils/web3/getWeb3.js";
import ipfs from '../utils/ipfs/ipfsApi.js';
import { zeppelinSolidityHotLoaderOptions } from '../config/webpack';
import { Grid } from '@material-ui/core';
import { Loader, Button, Card, Input, Heading, Table, Form, Field } from 'rimble-ui';

export default class publish extends Component {
   
        constructor(props) {    
            super(props);
    
            this.state = {
              /////// Default state
              storageValue: 0,
              web3: null,
              accounts: null,
    
              /////// NFT concern
              NFTname: '',
    
              /////// Ipfs Upload
              buffer: null,
              ipfsHash: ''
            };
    
            /////// Handle
            this.handleNFTName = this.handleNFTName.bind(this);
            //this.handleNFTSymbol = this.handleNFTSymbol.bind(this);
            //this.handlePhotoPrice = this.handlePhotoPrice.bind(this);
    


            /////// Ipfs Upload
            this.captureFile = this.captureFile.bind(this);
            this.onSubmit = this.onSubmit.bind(this);
        }
        ///--------------------------
        /// Handler
        ///-------------------------- 
        handleNFTName(event) {
            this.setState({ valueNFTName: event.target.value });
               }
    

        captureFile(event) {
            event.preventDefault()
            const file = event.target.files[0]
            
            const reader = new window.FileReader()
            reader.readAsArrayBuffer(file)  // Read bufffered file
    
            // Callback
            reader.onloadend = () => {
              this.setState({ buffer: Buffer(reader.result) })
              console.log('=== buffer ===', this.state.buffer)
            }
        }
          
        onSubmit(event) {
            const { web3, accounts, NFTBasic, NFTname } = this.state;
    
            event.preventDefault()
    
            ipfs.add(this.state.buffer, (error, result) => {
              // In case of fail to upload to IPFS
              if (error) {
                console.error(error)
                return
              }
              console.info(result)
              const nftName = NFTname;
              // In case of successful to upload to IPFS
              this.setState({ ipfsHash: result[0].hash });
              console.log('=== ipfsHash ===', this.state.ipfsHash);
              console.log('=== nftName ===', nftName);
              this.setState({ 
                valueNFTName: '',
              });
    
              //let PHOTO_NFT;  /// [Note]: This is a photoNFT address created
              const ipfsHashOfPhoto = this.state.ipfsHash;
              let PhotoNFT = {};
              PhotoNFT = require("../../../build/contracts/NFTBasic.json");
              PhotoNFT.methods.PreMint(nftName, ipfsHashOfPhoto).send({ from: accounts[0] })
              .once('receipt', (receipt) => {
                console.log('=== receipt ===', receipt);
    
                const PHOTO_NFT = receipt.events.PhotoNFTCreated.returnValues.photoNFT;
                console.log('=== PHOTO_NFT ===', PHOTO_NFT);
    
                /// Get instance by using created photoNFT address
                let BasicNFT = {};
                PhotoNFT = require("../../../build/contracts/NFTBasic.json"); 
                let photoNFT = new web3.eth.Contract(PhotoNFT.abi);
                console.log('=== photoNFT ===', photoNFT);
                const photoId = 1;
                photoNFT.methods.ownerOf(photoId).call().then(owner => console.log('=== owner of photoId 1 ===', owner));
                
                /// [Note]: Promise (nested-structure) is needed for executing those methods below (Or, rewrite by async/await)

              })
            })
        }  

        componentDidMount = async () => {
            const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;
         
            let BasicNFT = {};
            try {
              BasicNFT = require("../../../build/contracts/NFTBasic.json"); // Load ABI of contract of BasicNFT
            } catch (e) {
              console.log(e);
            }
    
            try {
              const isProd = process.env.NODE_ENV === 'production';
              if (!isProd) {
                // Get network provider and web3 instance.
                const web3 = await getWeb3();
                let ganacheAccounts = [];
    
                try {
                  ganacheAccounts = await this.getGanacheAddresses();
                } catch (e) {
                  console.log('Ganache is not running');
                }
    
                // Use web3 to get the user's accounts.
                const accounts = await web3.eth.getAccounts();
                // Get the contract instance.
                const networkId = await web3.eth.net.getId();
                const networkType = await web3.eth.net.getNetworkType();
                const isMetaMask = web3.currentProvider.isMetaMask;
                let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
                balance = web3.utils.fromWei(balance, 'ether');
    
                let instanceBasicNFT = null;
                let CNSTY_contractDeplAddress;
                let deployedNetwork = null;
    
                // Create instance of contracts
                if (BasicNFT.networks) {
                  deployedNetwork = BasicNFT.networks[networkId.toString()];
                  if (deployedNetwork) {
                    instanceBasicNFT = new web3.eth.Contract(
                      BasicNFT.abi,
                      deployedNetwork && deployedNetwork.address,
                    );
                    console.log('=== instanceBasicNFT ===', instanceBasicNFT);
                  }
                }

    
                if (instanceBasicNFT) {
                    // Set web3, accounts, and contract to the state, and then proceed with an
                    // example of interacting with the contract's methods.
                    this.setState({ 
                        web3, 
                        ganacheAccounts, 
                        accounts, 
                        balance, 
                        networkId, 
                        networkType, 
                        hotLoaderDisabled,
                        isMetaMask, 
                        BasicNFT: instanceBasicNFT,
                        CNSTY_contractDeplAddress: CNSTY_contractDeplAddress }, () => {
                          this.refreshValues(instanceBasicNFT);
                          setInterval(() => {
                            this.refreshValues(instanceBasicNFT);
                        }, 5000);
                    });
                }
                else {
                  this.setState({ web3, ganacheAccounts, accounts, balance, networkId, networkType, hotLoaderDisabled, isMetaMask });
                }
              }
            } catch (error) {
              // Catch any errors for any of the above operations.
              alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
              );
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
              console.log('refreshValues of instanceBasicNFT');
            }
        }
        render()  {
            return (
                <div><h1>publish</h1>
                <div >
                    <Grid container style={{ marginTop: 20 }}>
                        <Grid item xs={10}>
                            <Card width={"420px"} 
                                  maxWidth={"420px"} 
                                  mx={"auto"} 
                                  my={5} 
                                  p={20} 
                                  borderColor={"#E8E8E8"}
                            >
                                <h2>Publish and Put on Sale</h2>
                                <p>Please upload your photo and put on sale from here!</p>
    
                                <Form onSubmit={this.onSubmit}>
                                    <Field label="Photo NFT Name">
                                        <Input
                                            type="text"
                                            width={1}
                                            placeholder="e.g) Art NFT Token"
                                            required={true}
                                            value={this.state.valueNFTName} 
                                            onChange={this.handleNFTName} 
                                        />
                                    </Field> 
    
                                    {/*
                                    <Field label="Photo NFT Symbol">
                                        <Input
                                            type="text"
                                            width={1}
                                            placeholder="e.g) ARNT"
                                            required={true}
                                            value={this.state.valueNFTSymbol} 
                                            onChange={this.handleNFTSymbol}                                        
                                        />
                                    </Field>
                                    */}
    
                                    <Field label="Photo for uploading to IPFS">
                                        <input 
                                            type='file' 
                                            onChange={this.captureFile} 
                                            required={true}
                                        />
                                    </Field>
    
                                    <Button size={'medium'} width={1} type='submit'>Upload my photo and put on sale</Button>
                                </Form>
                            </Card>
                        </Grid>
    
                        <Grid item xs={1}>
                        </Grid>
    
                        <Grid item xs={1}>
                        </Grid>
                    </Grid>
                </div>
                </div>
            );
        }
    }
