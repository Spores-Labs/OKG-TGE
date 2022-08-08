import { Contract } from 'ethers';
import * as conf from '../config';
import { PeriodicVesting } from '../typechain';

module.exports = async ({ ethers, deployments, hardhatArguments }: any) => {
  const network: string = hardhatArguments.network
    ? hardhatArguments.network
    : 'development';
  const [deployer] = await ethers.getSigners();
  console.log('deployed by:', deployer.address);

  const { deploy, get, execute } = deployments;
  const initBal = await ethers.provider.getBalance(deployer.address);

  const okg = await get('OKGToken');

  const deployVestingConf = {
    from: deployer.address,
    log: true,
    args: [okg.address],
  };
  const executeConf = {
    from: deployer.address,
    log: true,
  };

  await deploy('PeriodicVesting', deployVestingConf);

  // for (const u of upfronts) {
  //   await execute('OKGToken', executeConf, 'transfer', u.address, u.total);
  // }
  // await execute('OKGToken', executeConf, 'transfer', vesting.address, total);
  const newBal = await ethers.provider.getBalance(deployer.address);
  console.log(
    `gas cost: ${ethers.utils.formatEther(initBal.sub(newBal).toString())}`
  );
};
