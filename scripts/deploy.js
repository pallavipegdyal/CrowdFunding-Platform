const fs = require("fs");
const hre = require("hardhat");

//0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

async function main() {

    const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
    const crowdFunding = await CrowdFunding.deploy();

    await crowdFunding.deployed();

    console.log("CrowdFunding deployed to:", crowdFunding.address);

    const config = `
    export const CrowdFundingAddress = "${crowdFunding.address}";
  `;

   fs.writeFileSync("./Context/config.js", config);

}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

