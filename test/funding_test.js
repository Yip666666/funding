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
    let fundingAddresss;
    it('获取账号', async () => {
        accounts = await web3.eth.getAccounts();
        console.log(`accounts[0]` + accounts[0]);
    });

    it('1 发起众筹', async () => {
        let result = await ffContract.methods.createFunding("众筹商品1", 111, 1000).send({
            from: accounts[0],
            gas: "3000000"
        });
        result = await ffContract.methods.createFunding("众筹商品2", 222, 2000).send({
            from: accounts[0],
            gas: "3000000"
        });
        console.log(result);
    });

    it('2 查看所有众筹项目列表', async () => {
        fundingAddresses = await ffContract.methods.getFundings().call();
        console.log(fundingAddresses);
    });

    it('3 参与众筹项目', async () => {
        fundingContract.options.address = fundingAddresses[0];
        let resulet = await fundingContract.methods.support().send({
            from: accounts[1],
            value: 111,
            gas: "3000000"
        })
        resulet = await fundingContract.methods.support().send({
            from: accounts[2],
            value: 111,
            gas: "3000000"
        })
        console.log(resulet);
    });

    it('4 查看自己创建的众筹项目列表', async () => {
        const arr = await ffContract.methods.getCreatorFundings().call({from: accounts[0]});
        console.log(arr);
    })

    it('5 查看自己参与的众筹项目列表', async () => {
        const arr = await ffContract.methods.getPlayerFundings().call({from: accounts[1]});
        console.log(arr);
    })

    it('6 发起付款请求', async () => {
        fundingContract.options.address = fundingAddresses[0];
        const result = await fundingContract.methods.createRequest("请求买材料", 100, accounts[9]).send({
            from: accounts[0],
            gas: "3000000"
        });
        console.log(result);
    });

    it('7 查看指定众筹项目的付款请求列表', async () => {
        const request = await fundingContract.methods.requests(0).call();
        console.log(request);
    });
    
    it('7.5 审批请求', async () => {
        await fundingContract.methods.approveRequest(0).send({from: accounts[1], gas: "3000000"});
        await fundingContract.methods.approveRequest(0).send({from: accounts[2], gas: "3000000"});
        const request = await fundingContract.methods.requests(0).call();
        console.log(request);
    });

    it('8 完成付款操作', async () => {
        let result = await fundingContract.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: "3000000"
        });
        console.log(result);
        const request = await fundingContract.methods.requests(0).call();
        console.log(request);
    });
});