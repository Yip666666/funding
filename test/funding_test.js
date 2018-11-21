let Web3 = require("web3");
let ganache = require("ganache-cli");
let {FundingFactory, Funding} = require("../compile");

let web3 = new Web3(ganache.provider());


let ffContract;
let fundingContract;
deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts[0]);

    let estimateGas = await web3.eth.estimateGas({data: "0x" + FundingFactory.bytecode});
    console.log(`estimateGas: ${estimateGas}`);

    ffContract = await new web3.eth.Contract(JSON.parse(FundingFactory.interface))
        .deploy({data: FundingFactory.bytecode})
        .send({from: accounts[0], gas: estimateGas});
    fundingContract = new web3.eth.Contract(JSON.parse(Funding.interface));
};

before(async () => {
    await deploy();
});

describe('测试众筹合约', () => {
    let accounts;
    it('获取账号', async () => {
        accounts = await web3.eth.getAccounts();
        console.log(`accounts[0]` + accounts[0]);
    });

    it('发起众筹', async () => {
        let res = await ffContract.methods.createFunding("众筹物1", 11, 1111).send({
            from: accounts[0], gas: "3000000"
        });
            res = await ffContract.methods.createFunding("众筹物2", 22, 2222).send({
            from: accounts[0], gas: "3000000"
        });
        console.log(res);
    });

});