//Metamask sending trasactions:
//https://docs.metamask.io/guide/sending-transactions.html#transaction-parameters

detectMetamaskInstalled() //When the page is opened check for error handling issues.

let accounts = []; ////Empty array to be filled once Metamask is called.
document.getElementById("enableEthereumButton").innerHTML =  "Connect Metamask 🦊"
document.getElementById("getValueStateSmartContract").innerHTML =  "Loading..."

const baseSepoliaChainId = 84532;

const provider = new ethers.providers.Web3Provider(window.ethereum); //Imported ethers from index.html with "<script src="https://cdn.ethers.io/lib/ethers-5.6.umd.min.js" type="text/javascript"></script>".

// const signer = provider.getSigner(); //Do this when the user clicks "enableEthereumButton" which will call getAccount() to get the signer private key for the provider.  
 
const contractAddress_JS = '0xeD62F27e9e886A27510Dc491F5530996719cEd3d'
const contractABI_JS = [{"anonymous":false,"inputs":[],"name":"setEvent","type":"event"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"}],"name":"set","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"storedData","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]

const contractDefined_JS = new ethers.Contract(contractAddress_JS, contractABI_JS, provider);

// const contractDefined_JS = new ethers.Contract(contractAddress_JS, contractABI_JS, signer);


getDataOnChainToLoad()

async function getDataOnChainToLoad(){
  let chainIdConnected = await getChainIdConnected();

  if(chainIdConnected == baseSepoliaChainId){
    getStoredData()
  }
  if(chainIdConnected != baseSepoliaChainId){
    document.getElementById("getValueStateSmartContract").innerHTML =  "Install Metamask and select Base Sepolia Testnet to have a Web3 provider to read blockchain data."
  }

}

async function getStoredData() {
  let storedDataCallValue = await contractDefined_JS.storedData()
  if(storedDataCallValue === undefined){
    document.getElementById("getValueStateSmartContract").innerHTML =  "Install Metamask and select Sepolia Testnet to have a Web3 provider to read blockchain data."
  }
  else{
    document.getElementById("getValueStateSmartContract").innerHTML =  storedDataCallValue
  }
}

async function sentTxAsync(x) {

  const callDataObject = await contractDefined_JS.populateTransaction.set(x);
  const txData = callDataObject.data;

  ethereum
  .request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: accounts[0],
        to: contractAddress_JS,
        data: txData
      },
    ],
  })
  .then((txHash) => console.log(txHash))
  .catch((error) => console.error);  
    
}

contractDefined_JS.on("setEvent", () => {

  getStoredData()

});

//Connect to Metamask.
const ethereumButton = document.querySelector('#enableEthereumButton');
ethereumButton.addEventListener('click', () => {
    detectMetamaskInstalled()
    enableMetamaskOnSepolia()
});

// MODIFY CONTRACT STATE WITH SET FUNCTION WITH PREDEFINED DATA FROM WEB3.JS
const changeStateInContractEvent = document.querySelector('.changeStateInContractEvent');
changeStateInContractEvent.addEventListener('click', () => {
  checkAddressMissingMetamask()
  
  var inputContractText = document.getElementById("setValueSmartContract").value.toString();

  if(/^\d+$/.test(inputContractText)==false) {
    alert("Can only accept numeric characters.")
    return
  }

  if(BigInt(inputContractText) > (BigInt(2**256)-BigInt(1)) ) {
    alert("Value is larger than uin256 max value ((2^256)-1).")
    return
  }

  sentTxAsync(inputContractText)

})

//If Metamask is not detected the user will be told to install Metamask.
function detectMetamaskInstalled(){
  try{
     ethereum.isMetaMask
  }
  catch(missingMetamask) {
     alert("Metamask not detected in browser! Install Metamask browser extension, then refresh page!")
     document.getElementById("getValueStateSmartContract").innerHTML =  "Install Metamask and select Sepolia Testnet to have a Web3 provider to read blockchain data."

  }

}

//Alert user to connect their Metamask address to the site before doing any transactions.
function checkAddressMissingMetamask() {
  if(accounts.length == 0) {
    alert("No address from Metamask found. Click the top button to connect your Metamask account then try again without refreshing the page.")
  }
}

async function getChainIdConnected() {

  const connectedNetworkObject = await provider.getNetwork();
  const chainIdConnected = connectedNetworkObject.chainId;
  return chainIdConnected

}

async function getAccount() {
  accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  const signer = provider.getSigner();
  document.getElementById("enableEthereumButton").innerText = accounts[0].substr(0,5) + "..." +  accounts[0].substr(38,4)  
}

async function enableMetamaskOnSepolia() {
  //Get account details from Metamask wallet.
  getAccount();

  // Updated chainId request method suggested by Metamask.
  let chainIdConnected = await window.ethereum.request({method: 'net_version'});

  // // Outdated chainId request method which might get deprecated:
  // //  https://github.com/MetaMask/metamask-improvement-proposals/discussions/23
  // let chainIdConnected = window.ethereum.networkVersion;

  console.log("chainIdConnected: " + chainIdConnected)

  //Check if user is on the Sepolia testnet. If not, alert them to change to Sepolia.
  if(chainIdConnected != baseSepoliaChainId){
    // alert("You are not on the Sepolia Testnet! Please switch to Sepolia and refresh page.")
    try{
      await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{
             chainId: "0x" + baseSepoliaChainId.toString(16) //Convert decimal to hex string.
          }]
        })
      location.reload(); 
      // alert("Failed to add the network at chainId " + baseSepoliaChainId + " with wallet_addEthereumChain request. Add the network with https://chainlist.org/ or do it manually. Error log: " + error.message)
    } catch (error) {
      alert("Failed to add the network at chainId " + baseSepoliaChainId + " with wallet_addEthereumChain request. Add the network with https://chainlist.org/ or do it manually. Error log: " + error.message)
    }
  }
}

// // Solidity 

// const contractAddress = '0xD96a275ca2e9Ef5B10bF9fDb106718b670Afc8B2'
// const contractABI = [{"inputs":[{"internalType":"address","name":"FluentRustAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"fluentRust","outputs":[{"internalType":"contractIFluentRust","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRustAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRustBool","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRustBytes","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRustBytes32","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRustInt256","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRustString","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRustUint256","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]

// const contractDeployed = new ethers.Contract(contractAddress, contractABI, provider);

// let fluent_sepolia_chain_id = 20993;

// testSolidityContractRead()

// async function testSolidityContractRead() {

//   const connectedNetworkObject = await provider.getNetwork();
//   const chainIdConnected = connectedNetworkObject.chainId;
//   console.log("chainIdConnected: " + chainIdConnected)

//   if(chainIdConnected != fluent_sepolia_chain_id){
//     console.log("RPC endpoint not connected to Fluent Sepolia (chainId: " + fluent_sepolia_chain_id + ").");
//     console.log("Switch to Fluent Sepolia then try again.");
//     return;
//   }

//   const fluentRustContractAddress = await contractDeployed.fluentRust()
//   console.log("fluentRustContractAddress: " + fluentRustContractAddress)

//   const rustString = await contractDeployed.getRustString()
//   console.log("rustString: " + rustString)

//   const rustUint256 = await contractDeployed.getRustUint256()
//   console.log("rustUint256: " + rustUint256)

//   const rustInt256 = await contractDeployed.getRustInt256()
//   console.log("rustInt256: " + rustInt256)

//   const rustAddress = await contractDeployed.getRustAddress()
//   console.log("rustAddress: " + rustAddress)

//   const rustBytes = await contractDeployed.getRustBytes()
//   console.log("rustBytes: " + rustBytes)

//   const rustBytes32 = await contractDeployed.getRustBytes32()
//   console.log("rustBytes32: " + rustBytes32)

//   const rustBool = await contractDeployed.getRustBool()
//   console.log("rustBool: " + rustBool)

// }


// // Rust

// const contractAddress = '0x04160C19738bB6429c0554fBdC11A96079D7297D'
// const contractABI = [{"inputs":[],"name":"rustAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rustBool","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rustBytes","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rustBytes32","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rustInt256","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rustString","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rustUint256","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]

// const contractDeployed = new ethers.Contract(contractAddress, contractABI, provider);

// let fluent_sepolia_chain_id = 20993;

// testRustContractRead()

// async function testRustContractRead() {

//   const connectedNetworkObject = await provider.getNetwork();
//   const chainIdConnected = connectedNetworkObject.chainId;
//   console.log("chainIdConnected: " + chainIdConnected)

//   if(chainIdConnected != fluent_sepolia_chain_id){
//     console.log("RPC endpoint not connected to Fluent Sepolia (chainId: " + fluent_sepolia_chain_id + ").");
//     console.log("Switch to Fluent Sepolia then try again.");
//     return;
//   }

//   const rustString = await contractDeployed.rustString()
//   console.log("rustString: " + rustString)

//   const rustUint256 = await contractDeployed.rustUint256()
//   console.log("rustUint256: " + rustUint256)

//   const rustInt256 = await contractDeployed.rustInt256()
//   console.log("rustInt256: " + rustInt256)

//   const rustAddress = await contractDeployed.rustAddress()
//   console.log("rustAddress: " + rustAddress)

//   const rustBytes = await contractDeployed.rustBytes()
//   console.log("rustBytes: " + rustBytes)

//   const rustBytes32 = await contractDeployed.rustBytes32()
//   console.log("rustBytes32: " + rustBytes32)

//   const rustBool = await contractDeployed.rustBool()
//   console.log("rustBool: " + rustBool)

// }
