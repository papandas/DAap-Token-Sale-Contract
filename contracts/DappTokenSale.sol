pragma solidity ^0.4.17;

import "./DappToken.sol";

contract DappTokenSale {
    address admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;

    event Sell(address _buyer, uint256 _amount);

    function DappTokenSale (DappToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;    
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        //ds-math
        // internal = for internal function of this contact and not accessable from out of the scope
        // pure = its not acctully readying data from blockchain and its just a pure function.
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        // Require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // Require that the contract has enought tokens
        require(tokenContract.balanceOf(this) >= _numberOfTokens);
        // Require that a transfer is successfull
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        // Keep track of tokens
        tokenSold += _numberOfTokens;

        // Trigger Sell Event
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin);
        require(tokenContract.transfer(msg.sender, tokenContract.balanceOf(this)));

        selfdestruct(admin);
    }
    
}
