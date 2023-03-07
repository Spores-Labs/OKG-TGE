import { Contract } from 'ethers';
import { deployments, ethers } from 'hardhat';
import * as conf from '../config';
import { PeriodicVesting } from '../typechain';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('execute from address: ', deployer.address);

  const { get } = deployments;
  const executeConf = {
    from: deployer.address,
    log: true,
  };

  const vesting = await get('PeriodicVesting');

  const contract = new Contract(
    vesting.address,
    vesting.abi,
    deployer
  ) as PeriodicVesting;

  const executePolicyParam = [
    'PeriodicVesting',
    executeConf,
    'setPolicy',
  ] as any[];
  const config = conf.pools;

  for (let i = 0; i < config.length; i++) {
    console.log('apply policy', config[i].params);
    let tx = await contract.setPolicy.apply(null, config[i].params);
    await tx.wait();

    const policies = [new Array(config[i].accounts[0].length).fill(i)];
    console.log('add beneficiaries', config[i].accounts.concat(policies));
    tx = await contract.addBeneficiaries.apply(
      null,
      config[i].accounts.concat(policies)
    );
    await tx.wait();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
