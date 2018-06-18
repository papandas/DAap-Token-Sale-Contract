module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!

  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      host:"localhost",
      port:8545,
      from: "0x2d62771cb1bbb9fc81289276014b76954a57b648",
      network_id: 4,
      gas: 4700000
    }
  }
};
