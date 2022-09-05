import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { OKGToken, PeriodicVesting } from '../typechain';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber } from 'ethers';

use(chaiAsPromised);
const decimal = BigNumber.from(10).pow(18);
const contractBal = decimal.mul(100000000);

describe('OKGToken contract', () => {
  let deployer: SignerWithAddress, users: SignerWithAddress[];
  let token: OKGToken;

  beforeEach(async () => {
    [deployer, ...users] = await ethers.getSigners();
    const tokenDeployer = await ethers.getContractFactory('OKGToken', deployer);

    token = (await tokenDeployer.deploy(
      'Ookeenga',
      'OKG',
      contractBal.mul(1000)
    )) as OKGToken;

    users.forEach((u) =>
      token.connect(deployer).transfer(u.address, contractBal)
    );
  });

  it('can pause all transfer', async () => {
    await token.pause();

    await expect(
      token.connect(users[0]).transfer(users[1].address, 1)
    ).rejectedWith('Transfer paused');
    await expect(
      token.connect(users[1]).transfer(users[0].address, 1)
    ).rejectedWith('Transfer paused');
  });

  it('whitelist user can transfer after pause', async () => {
    await token.pause();
    await token.whitelist(users[0].address, true);

    await expect(token.connect(users[0]).transfer(users[1].address, 1))
      .fulfilled;
    await expect(
      token.connect(users[1]).transfer(users[0].address, 1)
    ).rejectedWith('Transfer paused');
  });

  it('can transfer after unpause', async () => {
    await token.pause();

    await expect(
      token.connect(users[0]).transfer(users[1].address, 1)
    ).rejectedWith('Transfer paused');
    await expect(
      token.connect(users[1]).transfer(users[0].address, 1)
    ).rejectedWith('Transfer paused');

    await token.unpause();
    await expect(token.connect(users[0]).transfer(users[1].address, 1))
      .fulfilled;
  });

  it('can transfer after disable pause', async () => {
    await token.pause();

    await expect(
      token.connect(users[0]).transfer(users[1].address, 1)
    ).rejectedWith('Transfer paused');
    await expect(
      token.connect(users[1]).transfer(users[0].address, 1)
    ).rejectedWith('Transfer paused');

    await token.disablePause();
    await expect(token.connect(users[0]).transfer(users[1].address, 1))
      .fulfilled;
  });

  it('can\'t pause after disable pause', async () => {
    await token.pause();

    await expect(
      token.connect(users[0]).transfer(users[1].address, 1)
    ).rejectedWith('Transfer paused');
    await expect(
      token.connect(users[1]).transfer(users[0].address, 1)
    ).rejectedWith('Transfer paused');

    await token.disablePause();
    await expect(token.connect(users[0]).transfer(users[1].address, 1))
      .fulfilled;
    await expect(token.pause()).rejectedWith('Pause transfer disabled');
  });

  it('can blacklist user', async () => {
    await token.blacklist(users[0].address, true);

    await expect(
      token.connect(users[0]).transfer(users[1].address, 1)
    ).rejectedWith('Transfer blacklisted');
    await expect(
      token.connect(users[1]).transfer(users[0].address, 1)
    ).rejectedWith('Transfer blacklisted');
    await expect(token.connect(users[1]).transfer(users[2].address, 1))
      .fulfilled;
  });

  it('can disable blacklist forever', async () => {
    await token.blacklist(users[0].address, true);

    await expect(
      token.connect(users[0]).transfer(users[1].address, 1)
    ).rejectedWith('Transfer blacklisted');
    await expect(
      token.connect(users[1]).transfer(users[0].address, 1)
    ).rejectedWith('Transfer blacklisted');
    await expect(token.connect(users[1]).transfer(users[2].address, 1))
      .fulfilled;

    await token.disableBlacklist();
    await token.blacklist(users[2].address, true);

    await expect(token.connect(users[0]).transfer(users[1].address, 1))
      .fulfilled;
    await expect(token.connect(users[1]).transfer(users[0].address, 1))
      .fulfilled;
    await expect(token.connect(users[2]).transfer(users[1].address, 1))
      .fulfilled;
  });

  it("can't mint more than inital supply", async () => {
    const tx = token.mint(users[0].address, 1);
    await expect(tx).rejectedWith('ERC20Capped: cap exceeded');
  });

  it('can mint after token burn', async () => {
    await token.burn(100);
    await expect(token.mint(users[0].address, 10)).fulfilled;
  });
});
