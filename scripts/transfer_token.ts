import { Contract } from 'ethers';
import { deployments, ethers } from 'hardhat';
import { total, upfronts } from '../config';
import { OKGToken } from '../typechain';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('execute from address: ', deployer.address);

  const { get } = deployments;
  const executeConf = {
    from: deployer.address,
    log: true,
  };

  const vesting = await get('PeriodicVesting');
  const token = await get('OKGToken');

  const tokenContract = new Contract(token.address, token.abi, deployer) as OKGToken;

  for (const u of upfronts) {
    console.log('transfer to', u.address, 'amount of', ethers.utils.formatEther(u.total));
    await tokenContract.transfer(u.address, u.total);
  }
  console.log(
    'transfer to vesting amount of',
    ethers.utils.formatEther(total)
  );
  await tokenContract.transfer(vesting.address, total);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
