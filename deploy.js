const Web3 = require('web3');
const ganache = require('ganache-cli');
const web3 = new Web3(ganache.provider());

let {FundingFactory, Funding} = require("./compile");

deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    let estimateGas = await web3.eth.estimateGas({data: '0x' + FundingFactory.bytecode})
    console.log(`estimateGas: ${estimateGas}`);

    let contract = await new web3.eth.Contract(JSON.parse(FundingFactory.interface))
        .deploy({data:FundingFactory.bytecode})
        .send({from:accounts[0],gas:estimateGas});
    console.log(contract);
}

deploy();