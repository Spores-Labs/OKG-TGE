import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { OKGToken, PeriodicVesting } from '../typechain';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, utils } from 'ethers';

use(chaiAsPromised);
const decimal = BigNumber.from(10).pow(18);
const contractBal = decimal.mul(100000000);

describe('PeriodicVesting contract', () => {
  let deployer: SignerWithAddress, users: SignerWithAddress[];
  let token: OKGToken;
  let vesting: PeriodicVesting;

  before(async () => {
    [deployer, ...users] = await ethers.getSigners();
    const tokenDeployer = await ethers.getContractFactory('OKGToken', deployer);

    token = (await tokenDeployer.deploy(
      'Ookeenga',
      'OKG',
      contractBal.mul(1000),
    )) as OKGToken;
  });

  beforeEach(async () => {
    const vestingDeployer = await ethers.getContractFactory(
      'PeriodicVesting',
      deployer
    );
    vesting = (await vestingDeployer.deploy(token.address)) as PeriodicVesting;

    await token.transfer(vesting.address, contractBal);
  });

  it('can be deployed', async () => {
    expect(await vesting.token()).deep.equal(token.address);
  });

  it('should be able to set policy', async () => {
    const curr = (await ethers.provider.getBlock('latest')).timestamp;

    const policy = [2500, 10000, curr + 3600, curr + 7200, curr + 3600 * 3, 60];
    await vesting.setPolicy.apply(null, policy);

    const policies = await vesting.policies(0);

    for (let i = 0; i < policies.length - 1; i++) {
      expect(policies[i]).deep.equal(policy[i]);
    }
    expect(policies[6]).deep.equal(61);
  });

  it('can add multiple policies', async () => {
    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy0 = [
      2500,
      10000,
      curr + 3600,
      curr + 7200,
      curr + 3600 * 3,
      60,
    ];
    const policy1 = [
      1000,
      10000,
      curr + 1800,
      curr + 3600,
      curr + 3600 * 3,
      60,
    ];
    await vesting.setPolicy.apply(null, policy0);
    await vesting.setPolicy.apply(null, policy1);

    let policies = await vesting.policies(0);
    for (let i = 0; i < policies.length - 1; i++) {
      expect(policies[i]).deep.equal(policy0[i]);
    }
    expect(policies[6]).deep.equal(61);

    policies = await vesting.policies(1);
    for (let i = 0; i < policies.length - 1; i++) {
      expect(policies[i]).deep.equal(policy1[i]);
    }
    expect(policies[6]).deep.equal(121);
  });

  it('revert if vesting time invalid', async () => {
    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy = [2500, 10000, curr + 3600, curr + 7200, curr + 3600 * 3, 61];
    const tx = vesting.setPolicy.apply(null, policy);

    await expect(tx).revertedWith('Vesting timeline invalid');
  });

  it('revert if vestingStart before TGE', async () => {
    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy = [2500, 10000, curr + 7200, curr + 3600, curr + 3600 * 3, 60];
    const tx = vesting.setPolicy.apply(null, policy);

    await expect(tx).revertedWith('Vesting must start after TGE');
  });

  it('cannot add beneficiary when policy not existed', async () => {
    const beneficiary = users[0];
    const totalAmount = BigNumber.from(100000).mul(decimal);
    const tx = vesting.addBeneficiary(beneficiary.address, totalAmount, 0);

    await expect(tx).revertedWith('Policy not existed');
  });

  it('can add multiple beneficiaries', async () => {
    const beneficiaries = [];
    const totalAmounts = [];
    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy = [2500, 10000, curr + 3600, curr + 7200, curr + 3600 * 3, 60];
    await vesting.setPolicy.apply(null, policy);
    for (let i = 0; i < 30; i++) {
      beneficiaries.push(ethers.Wallet.createRandom());
      totalAmounts.push(
        BigNumber.from(100000)
          .mul(i + 1)
          .mul(decimal)
      );
    }

    await vesting.addBeneficiaries(
      beneficiaries.map((b) => b.address),
      totalAmounts,
      new Array(beneficiaries.length).fill(0)
    );
    await vesting.lock();
    const actualTotals = await Promise.all(
      beneficiaries.map((b) => vesting.getTotalAllocated(b.address))
    );

    return Promise.all(
      actualTotals.map((a, i) => expect(a).deep.equal(totalAmounts[i]))
    );
  });

  it('cannot add duplicate beneficiaries', async () => {
    const beneficiaries = [];
    const totalAmounts = [];
    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy = [2500, 10000, curr + 3600, curr + 7200, curr + 3600 * 3, 60];
    await vesting.setPolicy.apply(null, policy);
    for (let i = 0; i < 30; i++) {
      beneficiaries.push(ethers.Wallet.createRandom());
      totalAmounts.push(
        BigNumber.from(100000)
          .mul(i + 1)
          .mul(decimal)
      );
    }

    await vesting.addBeneficiaries(
      beneficiaries.map((b) => b.address),
      totalAmounts,
      new Array(beneficiaries.length).fill(0)
    );

    const tx = vesting.addBeneficiary(
      beneficiaries[0].address,
      totalAmounts[2],
      0
    );
    return expect(tx).revertedWith('Already added');
  });

  it('cannot add beneficiary after lock', async () => {
    const beneficiaries = [];
    const totalAmounts = [];
    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy = [2500, 10000, curr + 3600, curr + 7200, curr + 3600 * 3, 60];
    await vesting.setPolicy.apply(null, policy);
    for (let i = 0; i < 30; i++) {
      beneficiaries.push(ethers.Wallet.createRandom());
      totalAmounts.push(
        BigNumber.from(100000)
          .mul(i + 1)
          .mul(decimal)
      );
    }
    await vesting.lock();

    const tx = vesting.addBeneficiaries(
      beneficiaries.map((b) => b.address),
      totalAmounts,
      new Array(beneficiaries.length).fill(0)
    );

    await expect(tx).revertedWith('Locked already');
  });

  it('return correct TGE', async () => {
    const beneficiaries = users.slice(0, 4);
    const balances = await Promise.all(
      beneficiaries.map((b) => token.balanceOf(b.address))
    );
    const totalAmounts = new Array(4)
      .fill(BigNumber.from(100000).mul(decimal))
      .map((a, i) => a.mul(i + 1));

    const expectedTGE = totalAmounts.map((a) => a.mul(2500).div(10000));
    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy = [2500, 10000, curr + 3600, curr + 7200, curr + 3600 * 3, 60];
    await vesting.setPolicy.apply(null, policy);
    await vesting.addBeneficiaries(
      beneficiaries.map((b) => b.address),
      totalAmounts,
      new Array(beneficiaries.length).fill(0)
    );
    await vesting.lock();

    await ethers.provider.send('evm_setNextBlockTimestamp', [curr + 3600 + 1]);
    await Promise.all(beneficiaries.map((b) => vesting.connect(b).claim()));

    const balanceChange = (
      await Promise.all(beneficiaries.map((b) => token.balanceOf(b.address)))
    ).map((b, i) => b.sub(balances[i]));

    balanceChange.map((b, i) => expect(b).deep.equal(expectedTGE[i]));
    const claimed = await Promise.all(
      beneficiaries.map((b) => vesting.claimed(b.address))
    );
    claimed.map((b, i) => expect(b).deep.equal(expectedTGE[i]));
  });

  it('return correct TGE when owner release', async () => {
    const beneficiaries = users.slice(0, 4);
    const balances = await Promise.all(
      beneficiaries.map((b) => token.balanceOf(b.address))
    );
    const totalAmounts = new Array(4)
      .fill(BigNumber.from(100000).mul(decimal))
      .map((a, i) => a.mul(i + 1));

    const expectedTGE = totalAmounts.map((a) => a.mul(2500).div(10000));

    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy = [2500, 10000, curr + 3600, curr + 7200, curr + 3600 * 3, 60];
    await vesting.setPolicy.apply(null, policy);
    await vesting.addBeneficiaries(
      beneficiaries.map((b) => b.address),
      totalAmounts,
      new Array(beneficiaries.length).fill(0)
    );
    await vesting.lock();

    await ethers.provider.send('evm_setNextBlockTimestamp', [curr + 3600 + 1]);
    await vesting.release();

    const balanceChange = (
      await Promise.all(beneficiaries.map((b) => token.balanceOf(b.address)))
    ).map((b, i) => b.sub(balances[i]));

    balanceChange.map((b, i) => expect(b).deep.equal(expectedTGE[i]));
    const claimed = await Promise.all(
      beneficiaries.map((b) => vesting.claimed(b.address))
    );
    claimed.map((b, i) => expect(b).deep.equal(expectedTGE[i]));
  });

  it('return correct TGE with different policies when owner release', async () => {
    const beneficiaries = users.slice(0, 4);
    const balances = await Promise.all(
      beneficiaries.map((b) => token.balanceOf(b.address))
    );
    const totalAmounts = new Array(4)
      .fill(BigNumber.from(100000).mul(decimal))
      .map((a, i) => a.mul(i + 1));

    const firstTGE = totalAmounts.map((a, i) => {
      if (i < 2) return BigNumber.from(0);
      else return a.mul(1000).div(10000);
    });
    const expectedTGE = totalAmounts.map((a, i) => {
      if (i < 2) return a.mul(2500).div(10000);
      else return a.mul(1000).div(10000);
    });

    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policies = [
      [2500, 10000, curr + 3600, curr + 7200, curr + 3600 * 3, 60],
      [1000, 10000, curr + 1800, curr + 4800, curr + 3600 * 3, 60],
    ];
    await Promise.all(policies.map((p) => vesting.setPolicy.apply(null, p)));
    await vesting.addBeneficiaries(
      beneficiaries.map((b) => b.address),
      totalAmounts,
      [0, 0, 1, 1]
    );
    await vesting.lock();

    await ethers.provider.send('evm_setNextBlockTimestamp', [curr + 1800 + 1]);
    await vesting.release();

    let balanceChange = (
      await Promise.all(beneficiaries.map((b) => token.balanceOf(b.address)))
    ).map((b, i) => b.sub(balances[i]));
    balanceChange.map((b, i) => expect(b).deep.equal(firstTGE[i]));
    let claimed = await Promise.all(
      beneficiaries.map((b) => vesting.claimed(b.address))
    );
    claimed.map((b, i) => expect(b).deep.equal(firstTGE[i]));

    await ethers.provider.send('evm_setNextBlockTimestamp', [curr + 3600 + 1]);
    await vesting.release();

    balanceChange = (
      await Promise.all(beneficiaries.map((b) => token.balanceOf(b.address)))
    ).map((b, i) => b.sub(balances[i]));

    balanceChange.map((b, i) => expect(b).deep.equal(expectedTGE[i]));
    claimed = await Promise.all(
      beneficiaries.map((b) => vesting.claimed(b.address))
    );
    claimed.map((b, i) => expect(b).deep.equal(expectedTGE[i]));
  });

  it('return correct amount after a number of periods', async () => {
    const beneficiary = users[0];
    const totalAmount = BigNumber.from(100000);
    const initBal = await token.balanceOf(beneficiary.address);
    const expectedTGE = totalAmount.mul(2500).div(10000);
    const expectedVesting = totalAmount.sub(expectedTGE);
    const periodReturn = expectedVesting.mul(60).div(3600);
    let balanceChange = [];

    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy = [
      2500,
      10000,
      curr + 3600,
      curr + 7200,
      curr + 3600 * 3 - 60,
      60,
    ];
    await vesting.setPolicy.apply(null, policy);
    await vesting.addBeneficiary(beneficiary.address, totalAmount, 0);
    await vesting.lock();

    await ethers.provider.send('evm_setNextBlockTimestamp', [curr + 3600 + 1]);
    await vesting.connect(beneficiary).claim();
    const tgeBal = await token.balanceOf(beneficiary.address);
    balanceChange.push(tgeBal);

    for (
      let time = curr + 7200 + 1;
      time <= curr + 3600 * 3 - 60 + 1;
      time = time + 60
    ) {
      await ethers.provider.send('evm_setNextBlockTimestamp', [time]);
      await vesting.connect(beneficiary).claim();
      const newBal = await token.balanceOf(beneficiary.address);
      balanceChange.push(newBal);
      expect(newBal.sub(balanceChange[balanceChange.length - 2])).deep.equal(
        periodReturn
      );
    }
    balanceChange = balanceChange.map((b) => b.sub(initBal));

    expect(balanceChange[0]).deep.equal(expectedTGE);
    expect(balanceChange[balanceChange.length - 1]).deep.equal(totalAmount);
  });

  it('return correct amount after a number of periods when release by owner', async () => {
    const beneficiary = users[0];
    const totalAmount = BigNumber.from(100000);
    const initBal = await token.balanceOf(beneficiary.address);
    const expectedTGE = totalAmount.mul(2500).div(10000);
    const expectedVesting = totalAmount.sub(expectedTGE);
    const periodReturn = expectedVesting.mul(60).div(3600);
    let balanceChange = [];

    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy = [
      2500,
      10000,
      curr + 3600,
      curr + 7200,
      curr + 3600 * 3 - 60,
      60,
    ];
    await vesting.setPolicy.apply(null, policy);
    await vesting.addBeneficiary(beneficiary.address, totalAmount, 0);
    await vesting.lock();

    await ethers.provider.send('evm_setNextBlockTimestamp', [curr + 3600 + 1]);
    await vesting.connect(beneficiary).claim();
    const tgeBal = await token.balanceOf(beneficiary.address);
    balanceChange.push(tgeBal);

    for (
      let time = curr + 7200 + 1;
      time <= curr + 3600 * 3 - 60 + 1;
      time = time + 60
    ) {
      await ethers.provider.send('evm_setNextBlockTimestamp', [time]);
      await vesting.release();
      const newBal = await token.balanceOf(beneficiary.address);
      balanceChange.push(newBal);
      expect(newBal.sub(balanceChange[balanceChange.length - 2])).deep.equal(
        periodReturn
      );
    }
    balanceChange = balanceChange.map((b) => b.sub(initBal));

    expect(balanceChange[0]).deep.equal(expectedTGE);
    expect(balanceChange[balanceChange.length - 1]).deep.equal(totalAmount);
  });

  it('return correct amount after a number of periods when TGEpercent is 0', async () => {
    const beneficiary = users[0];
    const totalAmount = BigNumber.from(100000);
    const initBal = await token.balanceOf(beneficiary.address);
    const expectedVesting = totalAmount;
    const periodReturn = expectedVesting.mul(60).div(3600);
    let balanceChange = [];

    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy = [
      0,
      10000,
      curr + 3600,
      curr + 7200,
      curr + 3600 * 3 - 60,
      60,
    ];
    await vesting.setPolicy.apply(null, policy);
    await vesting.addBeneficiary(beneficiary.address, totalAmount, 0);
    await vesting.lock();

    await ethers.provider.send('evm_setNextBlockTimestamp', [curr + 3600 + 1]);
    await vesting.connect(beneficiary).claim();
    const tgeBal = await token.balanceOf(beneficiary.address);
    balanceChange.push(tgeBal);

    for (
      let time = curr + 7200 + 1;
      time <= curr + 3600 * 3 - 60 + 1;
      time = time + 60
    ) {
      await ethers.provider.send('evm_setNextBlockTimestamp', [time]);
      await vesting.connect(beneficiary).claim();
      const newBal = await token.balanceOf(beneficiary.address);
      balanceChange.push(newBal);
    }
    balanceChange = balanceChange.map((b) => b.sub(initBal));

    expect(balanceChange[0]).deep.equal(0);
    expect(balanceChange[balanceChange.length - 1]).deep.equal(totalAmount);
  });

  it('cannot claim if balance is insufficient when TGE', async () => {
    const beneficiary = users[0];
    const totalAmount = contractBal.mul(5);

    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy = [2500, 10000, curr + 3600, curr + 7200, curr + 3600 * 3, 60];
    await vesting.setPolicy.apply(null, policy);
    await vesting.addBeneficiary(beneficiary.address, totalAmount, 0);
    await vesting.lock();
    await ethers.provider.send('evm_setNextBlockTimestamp', [curr + 3600 + 1]);
    let claimTx = vesting.connect(beneficiary).claim();

    await expect(claimTx).revertedWith(
      'ERC20: transfer amount exceeds balance'
    );
  });

  it('cannot claim if balance is insufficient when vesting', async () => {
    const beneficiary = users[0];
    const totalAmount = contractBal.mul(4);

    const curr = (await ethers.provider.getBlock('latest')).timestamp;
    const policy = [2500, 10000, curr + 3600, curr + 7200, curr + 3600 * 3, 60];
    await vesting.setPolicy.apply(null, policy);
    await vesting.addBeneficiary(beneficiary.address, totalAmount, 0);
    await vesting.lock();
    await ethers.provider.send('evm_setNextBlockTimestamp', [curr + 3600 + 1]);
    await vesting.connect(beneficiary).claim();

    await ethers.provider.send('evm_setNextBlockTimestamp', [curr + 7200 + 1]);
    let claimTx = vesting.connect(beneficiary).claim();

    await expect(claimTx).revertedWith(
      'ERC20: transfer amount exceeds balance'
    );
  });
});
