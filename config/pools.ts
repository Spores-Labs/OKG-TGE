import { utils } from "ethers";

const MONTH = 3600 * 24 * 30;
const QUARTER = MONTH * 3;

export = {
  TGE: '2022-05-19T00:00:00Z',
  pools: [
    {
      name: 'seed',
      TGEpercentage: 5,
      vestingCliff: QUARTER,
      vestingPeriod: QUARTER,
      vestingCount: 6,
      accounts: [
        {
          address: '0x16efa79798245378aa50ec23020a638a96439372',
          total: 18000000,
        },
      ],
    },
    {
      name: 'private',
      TGEpercentage: 5,
      vestingCliff: QUARTER,
      vestingPeriod: QUARTER,
      vestingCount: 5,
      accounts: [
        {
          address: '0x566d8f15d155b4eead113faf1269ec124492750d',
          total: 46000000,
        },
      ],
    },
    {
      name: 'team & advisors & reserve',
      TGEpercentage: 0,
      vestingCliff: 0,
      vestingPeriod: MONTH,
      vestingCount: 7,
      accounts: [
        {
          address: '0x45745c9b881860de8e25b5ba7f055d007f252ca3',
          total: 50000000,
        },
        {
          address: '0x4034b12ca765992c3c98adb86abb52c8893e717a',
          total: 50000000,
        },
        {
          address: '0x5e9c49d9c95e79f853fd6cf8b6065b3995c9b10c',
          total: 15000000,
        },
        {
          address: '0xd0b2580057355e9a83b753cd2fbf8e3897ed4576',
          total: 51000000,
        },
      ],
    },
    {
      name: 'marketing',
      TGEpercentage: 0,
      vestingCliff: 0,
      vestingPeriod: MONTH,
      vestingCount: 37,
      accounts: [
        {
          address: '0xb660873740841deedfc3ba14839e3bb3c5a803f8',
          total: 25000000,
        },
        {
          address: '0xc99b9d4bbb924e3dec23db4a65cadd250845e8db',
          total: 25000000,
        },
        {
          address: '0xc0d773ca30871fef7c21cedfa60d380215d45a3d',
          total: 25000000,
        },
      ],
    },
    {
      name: 'earn & staking',
      TGEpercentage: 0,
      vestingCliff: 12 * MONTH,
      vestingPeriod: MONTH,
      vestingCount: 24,
      accounts: [
        {
          address: '0xbc595da2877a258a431226ac8a337a80127b0856',
          total: 150000000,
        },
      ],
    },
  ],
  upfront: [
    //liquidity
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
  ],
};
