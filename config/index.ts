import { utils } from 'ethers';
import { getPoolConfig, getTotalVesting } from './pools-conf';

export const token = {
  name: 'Ookeenga',
  symbol: 'OKG',
  initialSupply: utils.parseEther('500000000'),
  owner: '0x482bE3Ec3A24eE4FEc390576473dbc9DaD2E6d66',
};

export const upfronts = [
  // liquidity
  {
    address: '0xe7191ceaddd1cf90616a54d7eae57945a4c8c122',
    total: utils.parseUnits('7500000', 18),
  },
  {
    address: '0x70e391b4b92692ddefbf133911215d08bbb03ab5',
    total: utils.parseUnits('7500000', 18),
  },
  {
    address: '0xecac15b131de8bd23f56ae34dd68febdada375e4',
    total: utils.parseUnits('10000000', 18),
  },
  // public sale
  {
    address: '0x8fc11151355e0f7e3351c7bdf5015b10b4e1ccf8',
    total: utils.parseUnits('20000000', 18),
  },
];

export const getPools = getPoolConfig;
export const getTotal = getTotalVesting;