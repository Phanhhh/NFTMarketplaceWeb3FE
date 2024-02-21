const hre = require("hardhat");
async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.waitForDeployment();
  console.log("NFTMarketplace deployed contract Address: ", nftMarketplace.target);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});