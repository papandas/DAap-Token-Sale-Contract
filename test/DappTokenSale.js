var DappToken = artifacts.require("./DappToken.sol");
var DappTokenSale = artifacts.require("./DappTokenSale.sol");

contract('DappTokenSale', function(accounts){
    var tokenInstance;
    var tokenSaleInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokenPrice = 1000000000000000000;
    var tokenAvailable = 750000;
    var numberOfTokens = 10;
            

    it("Initialize the contract with the correct values", function(){
        return DappTokenSale.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address){
            console.log(address);
            assert.notEqual(address, 0x0, "Has contract addresss");
            return tokenSaleInstance.tokenContract();
        }).then(function(address){
            console.log(address);
            assert.notEqual(address, 0x0, "Has contract address");
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            console.log(price);
            assert.equal(price, tokenPrice, "token price is correct.")
        });
    });


    it("Facilitates the token bying", function(){
        return DappToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return DappTokenSale.deployed();
        }).then(function(instance){
            tokenSaleInstance = instance;
            return tokenInstance.transfer(tokenSaleInstance.address, tokenAvailable, {from:admin});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "Transfer event was triggered");
            assert.equal(receipt.logs[0].event, "Transfer", "the event type is correct");
            assert.equal(receipt.logs[0].args._from, admin, "checking from ADMIN Account");
            assert.equal(receipt.logs[0].args._to, tokenSaleInstance.address, "checking from TO Account");
            assert.equal(receipt.logs[0].args._value, tokenAvailable, "checking from Token Value");
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            //console.log("Balance for Contract is ", balance.toNumber());
            return tokenInstance.balanceOf(admin);
        }).then(function(balance){
            //console.log("Balance for Admin is ", balance.toNumber());
            return tokenSaleInstance.buyTokens(numberOfTokens, {from:buyer, value: tokenPrice * numberOfTokens})
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            assert.equal(receipt.logs[0].event, "Sell", "the event type is correct");
            assert.equal(receipt.logs[0].args._buyer, buyer, "checking from buyers account"); 
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, "checking from number of tokesn"); 
            return tokenSaleInstance.tokenSold();
        }).then(function(amount){
            assert.equal(amount.toNumber(), numberOfTokens, "increament the number of token sold");
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            //console.log("Balance for Contract is:", balance.toNumber());
            assert.equal(balance.toNumber(), tokenAvailable - numberOfTokens);
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance){
            //console.log("Balance for Buyer is:", balance.toNumber());
            assert.equal(balance.toNumber(), numberOfTokens);
            return tokenSaleInstance.buyTokens(numberOfTokens, {from:buyer, value: 1})
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf("revert") >= 0, "msg.value must have equal number of tokens in wei");
            return tokenSaleInstance.buyTokens(800000, {from:buyer, value: tokenPrice * numberOfTokens})
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf("revert") >= 0, "Cannot purchase more tooken then available.");
        });
    });


    it("Ending Token Sales", function(){
        return DappToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return DappTokenSale.deployed();
        }).then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.endSale({from:buyer});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf("revert") >= 0, "Has to be an Admin, and not a Buyer");
            return tokenSaleInstance.endSale({from:admin});
        }).then(function(receipt){
            //return tokenSaleInstance.tokenSold();
        //}).then(function(amount){
            //assert.equal(amount.toNumber(), numberOfTokens, "Checking Token Sold");
            return tokenInstance.balanceOf(admin);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 999990, "Admin balance Checking.");
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 0, "Contract balance Checking.");
        })
    });

    
});