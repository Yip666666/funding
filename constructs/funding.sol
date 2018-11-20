pragma solidity ^0.4.25;

contract FundingFactory {
    //存储所有已经部署的众筹合约的地址
    address[] public fundings;

    //创建众筹
    function createFunding(string _projectName, uint _supportMoney, uint _goalMoney) public {
        address funding = new Funding(_projectName, _supportMoney, _goalMoney, msg.sender);
        fundings.push(funding);
    }
}

contract Funding {
    bool public flag = false;
    address public manager;
    string public projectName;
    uint public supportMoney;
    uint public endTime;
    uint public goalMoney;
    address[] public players;
    mapping(address => bool)  playersMap;

    //众筹构造函数
    constructor(string _projectName, uint _supportMoney, uint _goalMoney, address _address) public {
        manager = _address;
        projectName = _projectName;
        supportMoney = _supportMoney;
        goalMoney = _goalMoney;
        endTime = now + 4 weeks;
    }

    //参与人支持众筹
    function support() public payable {
        require(msg.value == supportMoney);
        players.push(msg.sender);
        playersMap[msg.sender] = true;
    }

    //获取参与者数量
    function getPlayersCount() public view returns (uint){
        return players.length;
    }
    //获取参与者
    function getPlayers() public view returns (address[]){
        return players;
    }
    //获取众筹合约的资金
    function getTotalBalance() public view returns (uint){
        return address(this).balance;
    }
    //获取endTime
    function getRemainDays() public view returns (uint){
        return (endTime - now) / 24 / 60 / 60;
    }
    //获取众筹状态
    function checkStatus() public {
        require(!flag);
        require(now >= endTime);
        require(address(this).balance >= goalMoney);
        flag = true;
    }

    //管理者权限
    modifier managerAuthority(){
        require(msg.sender == manager);
        _;
    }

    //存储付款请求的数组
    Request[] public requests;

    // 付款请求的结构体
    struct Request {
        string description;
        uint money;
        address shopAddress;
        bool complete;
        mapping(address => bool) votedMap;
        uint voteCount;
    }

    //创建合约付款请求
    function createRequest(string _description, uint _money, address _shopAddress) public managerAuthority {
        require(_money <= this.balance);
        Request memory request = Request({
            description : _description,
            money : _money,
            shopAddress : _shopAddress,
            complete : false,
            voteCount : 0
            });
        requests.push(request);
    }

    //众筹参与者批准一笔付款请求
    function approveRequest(uint index) public {
        Request storage request = requests[index];
        require(playersMap[msg.sender]);
        require(!requests[index].votedMap[msg.sender]);
        request.voteCount++;
        requests[index].votedMap[msg.sender] = true;
    }

    //完成付款请求
    function finalizeRequest(uint index) public managerAuthority {
        Request storage request = requests[index];
        require(!request.complete);
        require(request.voteCount * 2 > players.length);
        require(this.balance >= request.money);
        request.shopAddress.transfer(request.money);
        request.complete = true;
    }
}