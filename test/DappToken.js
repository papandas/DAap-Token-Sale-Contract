var DappToken = artifacts.require("./DappToken.sol");

contract('Dapp Token', function(accounts){

    it('Sets the Total Supply upon deployemnt', function(){
        return DappToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(token){
            //console.log("Total Token: ", token.toNumber());
            assert.equal(token.toNumber(), 1000000, 'Is correct!');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            //console.log("Balance for ", accounts[0], " is ", balance.toNumber());
            assert.equal(balance.toNumber(), 1000000, "Correct");
        });
    });

    it("Transfer token ownership", function(){
        return DappToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 4000000);
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            return tokenInstance.transfer(accounts[1], 100000, { from: accounts[0] });
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            assert.equal(receipt.logs[0].event, "Transfer", "the event type is correct");
            assert.equal(receipt.logs[0].args._from, accounts[0], "checking from sender account"); 
            assert.equal(receipt.logs[0].args._to, accounts[1], "checking from receiver account"); 
            assert.equal(receipt.logs[0].args._value, 100000, "checking from transer value"); 
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            //console.log("Balance for ", accounts[0], " is ", balance.toNumber());
            //assert.equal(balance.toNumber(), 1000000, "reduices from Sender");
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance){
            //console.log("Balance for ", accounts[1], " is ", balance.toNumber());
            //assert.equal(balance.toNumber(), 1000000, "add to the receiver");
        });
    });


    it("Approves token for delegated transfer", function(){
        return DappToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[0], 25000);
        }).then(function(success){
            //console.log(success);
            assert.equal(success, true, "It returns True");
            return tokenInstance.approve(accounts[1], 500, {from: accounts[0]});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            assert.equal(receipt.logs[0].event, "Approval", "the event type is correct");
            assert.equal(receipt.logs[0].args._owner, accounts[0], "checking from sender account"); 
            assert.equal(receipt.logs[0].args._spender, accounts[1], "checking from receiver account"); 
            assert.equal(receipt.logs[0].args._value, 500, "checking from transer value"); 
        })
    });

    it("Handles delegated token transfers", function(){
        return DappToken.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            return tokenInstance.transfer(fromAccount, 100, {from : accounts[0]});
        }).then(function(success){
            return tokenInstance.approve(spendingAccount, 10, { from:fromAccount});
        }).then(function(success){
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "Cannot transfer value larger then balance.");
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "Cannot transfer value larger then balance.");
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount});
        }).then(function(receipt){
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            //console.log("Balance for accounts[0] is ", balance.toNumber());
            return tokenInstance.balanceOf(accounts[2]);
        }).then(function(balance){
            //console.log("Balance for accounts[2]/fromAccount is ", balance.toNumber());
            return tokenInstance.balanceOf(accounts[3]);
        }).then(function(balance){
            //console.log("Balance for accounts[3]/toAccount is ", balance.toNumber());
            return tokenInstance.balanceOf(accounts[4]);
        }).then(function(balance){
            //console.log("Balance for accounts[4]/spendingAccount is ", balance.toNumber());
            //return tokenInstance.balanceOf(accounts[2]);
        });
    });
});