import { BigNumber, BigNumberish, utils } from 'ethers';
import pools from './pools';

type Configuration = {
  TGE: string | number,
  pools: PoolsConfig[],
}

type PoolsConfig = {
  name: string;
  TGEpercentage: number;
  vestingCliff: number;
  vestingPeriod: number;
  vestingCount: number;
  accounts: Account[];
};

type PoolsParams = {
  params: number[];
  accounts: AccountParam;
};

type AccountParam = [string[], BigNumber[]];

type Account = {
  address: string;
  total: BigNumberish;
};

function parseTimestamp(date: number | string): number | undefined {
  if (date == undefined) {
    return undefined;
  }
  let dateObj: Date;
  switch (typeof date) {
    case 'number':
      dateObj = new Date(date * 1000);
      break;

    default:
      dateObj = new Date(date);
      break;
  }

  return Math.floor(dateObj.getTime() / 1000);
}

const toAccountParam = (accounts: Account[]): AccountParam => {
  return accounts.reduce((acc, account) => {
    acc[0].push(account.address);
    acc[1].push(utils.parseEther(account.total.toString()));
    return acc;
  }, [[], []]);
};

const toParam = (pool: PoolsConfig, TGE: string | number): number[] => {
  const tgeTime = parseTimestamp(TGE);
  const vestingStart = tgeTime + pool.vestingCliff;
  const vestingEnd = tgeTime + (pool.vestingCount - 1) * pool.vestingPeriod;
  const percent = Math.floor(pool.TGEpercentage * 100);
  return [
    percent,
    10000,
    tgeTime,
    vestingStart,
    vestingEnd,
    pool.vestingPeriod,
  ];
};

export const getTotalVesting = (pools: PoolsParams[]): BigNumber => {
  const sumReduce = (pool: PoolsParams) =>
    pool.accounts[1].reduce((acc, curr) => acc.add(curr), BigNumber.from(0));

  return pools.map(sumReduce).reduce((acc, curr) => acc.add(curr), BigNumber.from(0));
}

export const getUpfront = () => {
  return pools.upfront;
}

export const getPoolConfig = (): PoolsParams[] => {
  const poolConf = pools as Configuration;
  return poolConf.pools.map((p: PoolsConfig) => {
    return {
      params: toParam(p, poolConf.TGE),
      accounts: toAccountParam(p.accounts),
    };
  });
};
