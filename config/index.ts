import { utils } from 'ethers';
import { getPoolConfig, getTotalVesting, getUpfront } from './pools-conf';

export const token = {
  name: 'Ookeenga',
  symbol: 'OKG',
  initialSupply: utils.parseEther('500000000'),
  owner: '0x482bE3Ec3A24eE4FEc390576473dbc9DaD2E6d66',
};

export const upfronts = getUpfront();
export const pools = getPoolConfig();
export const total = getTotalVesting(pools);
