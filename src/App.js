import React, { Component } from "react";
import AuctionContract from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = {highestBid:0, ContractBalance: 0, highestBidder: "None yet", web3: null, accounts: null, contract: null, input:""};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        AuctionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      const response = await instance.methods.getContractBalance().call();
      const responsee = await instance.methods.highestBid().call();
      const responseee = await instance.methods.highestBidder().call();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, highestBid: responsee, ContractBalance: response, highestBidder: responseee });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runBid = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value.
    await contract.methods.bid().send({ from: accounts[0], value: this.state.bidValue});

    //Get the value from the contract to prove it worked.
    const response = await contract.methods.getContractBalance().call()
    const responsee = await contract.methods.highestBid().call()
    const responseee = await contract.methods.highestBidder().call()

    // Update state with the result.
    this.setState({ ContractBalance: response });
    this.setState({ highestBid: responsee });
    this.setState({ highestBidder: responseee });
  };

  myChangeHandler = (event) => {
    this.setState({bidValue: event.target.value}, () => {
	//console.log(this.state.bidValue)
    });
  }

  runWithdraw = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value.
    await contract.methods.withdraw().send({ from: accounts[0]});

    //Get the value from the contract to prove it worked.
    const response = await contract.methods.getContractBalance().call()

    // Update state with the result.
    this.setState({ ContractBalance: response });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Welcome to our page, join our Auction!</h1>
        <div>The Contract's Balance is: {this.state.ContractBalance}</div>
        <br></br>
        <div>The Highest Bid is: {this.state.highestBid}</div>
        <br></br>
        <div>The Highest Bidder is:<br></br> {this.state.highestBidder}</div>
        <br></br>
        <div>To make a new bid select:</div>
        <input type="text" onChange={this.myChangeHandler} />
        <button onClick={this.runBid}>BID</button>
        <br></br><br></br>

        <div>To withdraw your money select:</div>
        <button onClick={this.runWithdraw}>WITHDRAW</button>
      </div>
    );
  }
}

export default App;
