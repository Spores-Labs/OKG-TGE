import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-solhint';
import 'hardhat-deploy';
import '@typechain/hardhat';

const mnemonic = process.env.MNEMONIC;

module.exports = {
  typechain: {
    outDir: './typechain',
    target: 'ethers-v5',
  },

  solidity: {
    compilers: [
      {
        version: '0.8.13',
      },
    ],
  },

  gasReporter: {
    enabled: true,
  },

  networks: {
    hardhat: {
      accounts: {
        count: 10,
      },
      gasPrice: 10000000000,
      live: false,
      saveDeployments: false,
    },
    development: {
      url: 'http://127.0.0.1:8545', // Localhost (default: none)
      accounts: {
        mnemonic: mnemonic,
        count: 10,
      },
      live: false,
      saveDeployments: true,
    },
    polygon: {
      url: process.env.MATIC_POLYGON_PROVIDER,
      chainId: 137,
      gasPrice: 30000000000,
      accounts: [process.env.OWNER_PRIV_KEY],
      timeout: 9000000,
      live: true,
    },
    mumbai: {
      url: process.env.MUMBAI_POLYGON_PROVIDER,
      accounts: [process.env.OWNER_PRIV_KEY],
      timeout: 20000,
      gasPrice: 20000000000,
      chainId: 80001,
    },
    bsctest: {
      url: process.env.BSC_TESTNET_PROVIDER,
      accounts: [process.env.OWNER_PRIV_KEY],
      timeout: 900000,
      gasPrice: 10000000000,
      chainId: 97,
    },
    bscmainnet: {
      url: process.env.BSC_TESTNET_PROVIDER,
      accounts: [process.env.OWNER_PRIV_KEY],
      timeout: 9000000,
      gasPrice: 10000000000,
      chainId: 56,
      live: true,
    },
  },

  paths: {
    sources: './contracts',
    tests: './test',
    cache: './build/cache',
    artifacts: './build/artifacts',
    deployments: './deployments',
  },

  etherscan: {
    apiKey: process.env.BSCSCAN_API,
  },
};
