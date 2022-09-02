// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.0;

import './ERC20.sol';

contract GrantFund {
    address public token;
    struct FundStructure {
        address recipient;
        uint256 amount;
        uint256 timestamp;
        uint depositTime;
        bool isUnlocked;
    }
    mapping (address => FundStructure[]) public grantFund;

    constructor (address _token) {
        // _funder = msg.sender;
        token = _token;
    }

    function deposit(address _recipient, uint256 _amount, uint256 _timestamp) public {
        ERC20(token).transferFrom(msg.sender, address(this), _amount);
        FundStructure[] storage funds = grantFund[msg.sender];
        funds.push(FundStructure(_recipient, _amount, _timestamp, block.timestamp, false));
    }

    function unlock(address _owner, uint256 _id, address _to) public {
        FundStructure[] storage funds = grantFund[_owner];
        require(funds[_id].timestamp > block.timestamp - funds[_id].depositTime , "You cannot claim funds before timestamp!");
        funds[_id].isUnlocked == true;
        ERC20(token).transfer(_to, funds[_id].amount);
    }

    function remove(uint256 _id) public {
        FundStructure[] storage funds = grantFund[msg.sender];
        // require(funds[i].timestamp < block.timestamp - funds[i].depositTime, "You cannot remove grant before timestamp!");
        // require(balance > 0)
        require(funds[_id].amount > 0, "amount should be bigger than 0");
        require(funds[_id].isUnlocked == true, "funds should be unlocked");
        require(_id < funds.length, "index out of bound");

        ERC20(token).transfer(msg.sender, funds[_id].amount);
        delete funds[_id];
    }

}