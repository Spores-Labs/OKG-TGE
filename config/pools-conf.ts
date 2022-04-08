import { BigNumber, BigNumberish, utils } from 'ethers';
import pools from './pools.json';

type PoolsConfig = {
  name: string;
  TGEtime: string | number;
  TGEpercentage: number;
  vestingStart: string | number;
  vestingEnd: string | number;
  vestingPeriod: number;
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

const toParam = (pool: PoolsConfig): number[] => {
  const tgeTime = parseTimestamp(pool.TGEtime);
  const vestingStart = parseTimestamp(pool.vestingStart);
  const vestingEnd = parseTimestamp(pool.vestingEnd);
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

export const getPoolConfig = (): PoolsParams[] => {
  return (pools as PoolsConfig[]).map((p: PoolsConfig) => {
    return {
      params: toParam(p),
      accounts: toAccountParam(p.accounts),
    };
  });
};
