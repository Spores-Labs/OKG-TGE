import { token, upfronts } from '../config';

module.exports = async ({ ethers, deployments, hardhatArguments }: any) => {
  const network: string = hardhatArguments.network
    ? hardhatArguments.network
    : 'development';
  const [deployer] = await ethers.getSigners();
  console.log('deployed by:', deployer.address);

  const { deploy, execute } = deployments;

  const initBal = await ethers.provider.getBalance(deployer.address);

  const deployTokenConf = {
    from: deployer.address,
    log: true,
    args: [token.name, token.symbol, token.initialSupply],
  };
  const executeConf = {
    from: deployer.address,
    log: true,
  };

  await deploy('OKGToken', deployTokenConf);

  const newBal = await ethers.provider.getBalance(deployer.address);
  console.log(
    `gas cost: ${ethers.utils.formatEther(initBal.sub(newBal).toString())}`
  );
};
