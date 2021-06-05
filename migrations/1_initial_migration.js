const NFTBasic = artifacts.require("./NFTBasic.sol");

module.exports = function (deployer) {
  deployer.deploy(NFTBasic);
};
