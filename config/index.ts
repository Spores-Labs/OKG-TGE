import { utils } from 'ethers';
import { getPoolConfig, getTotalVesting, getUpfront } from './pools-conf';

export const token = {
  name: 'Ookeenga',
  symbol: 'OKG',
  initialSupply: utils.parseEther('500000000'),
};

export const upfronts = getUpfront();
export const pools = getPoolConfig();
export const total = getTotalVesting(pools);
