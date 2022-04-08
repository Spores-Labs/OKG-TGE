import { token, upfronts } from '../config';

module.exports = async ({ ethers, deployments, hardhatArguments }: any) => {
  const network: string = hardhatArguments.network
    ? hardhatArguments.network
    : 'development';
  const [deployer] = await ethers.getSigners();
  console.log('deployed by:', deployer.address);

  const { deploy, execute } = deployments;

  const deployTokenConf = {
    from: deployer.address,
    log: true,
    args: [token.name, token.symbol, token.initialSupply],
  };
  const executeConf = {
    from: deployer.address,
    log: true,
  };

  const okg = await deploy('OKGToken', deployTokenConf);
  for (const u of upfronts) {
    await execute('OKGToken', executeConf, 'transfer', u.address, u.total);
  }
};
