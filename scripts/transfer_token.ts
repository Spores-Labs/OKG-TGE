import { deployments, ethers } from 'hardhat';
import { total, upfronts } from '../config';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('deploy from address: ', deployer.address);

  const { execute, get } = deployments;
  const executeConf = {
    from: deployer.address,
    log: true,
  };

  const vesting = await get('PeriodicVesting');

  for (const u of upfronts) {
    await execute('OKGToken', executeConf, 'transfer', u.address, u.total);
  }
  await execute('OKGToken', executeConf, 'transfer', vesting.address, total);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
