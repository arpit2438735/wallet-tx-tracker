require('dotenv').config();
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const dayjs = require('dayjs');
const axios = require('axios');
const { fetchPaginatedTxs } = require('./utils/fetchPaginatedTxs');

const address = process.argv[2];

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

if (!address) {
  console.error(
    '❌ Please provide an Ethereum address.\nExample: node index.js 0xYourWalletAddress'
  );
  process.exit(1);
}

const outputDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function fetchNormalTransactions(address) {
  return fetchPaginatedTxs(
    (page, offset) =>
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=asc&apikey=${ETHERSCAN_API_KEY}`
  );
}

// ERC-20 Transfers
async function fetchERC20Transfers(address) {
  return fetchPaginatedTxs(
    (page, offset) =>
      `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=asc&apikey=${ETHERSCAN_API_KEY}`
  );
}

// ERC-721 Transfers
async function fetchERC721Transfers(address) {
  return fetchPaginatedTxs(
    (page, offset) =>
      `https://api.etherscan.io/api?module=account&action=tokennfttx&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=asc&apikey=${ETHERSCAN_API_KEY}`
  );
}

async function exportToCsv(records) {
  const csvWriter = createCsvWriter({
    path: `data/transactions.csv`,
    header: [
      { id: 'hash', title: 'Transaction Hash' },
      { id: 'timestamp', title: 'Date & Time' },
      { id: 'from', title: 'From Address' },
      { id: 'to', title: 'To Address' },
      { id: 'type', title: 'Transaction Type' },
      { id: 'value', title: 'Value / Amount (ETH)' },
      { id: 'gasFee', title: 'Gas Fee (ETH)' },
    ],
  });

  await csvWriter.writeRecords(records);
  console.log(`Exported ${records.length} transactions to data/transactions.csv`);
}

(async () => {
  try {
    const [ethTxs, erc20Txs, erc721Txs] = await Promise.all([
      fetchNormalTransactions(address),
      fetchERC20Transfers(address),
      fetchERC721Transfers(address),
    ]);

    const ethRecords = ethTxs.map((tx) => {
      // Convert value from wei to ETH by dividing by 10^18
      const valueEth = parseFloat(tx.value) / 1e18;
      const gasFeeEth = (parseFloat(tx.gasPrice) * parseFloat(tx.gasUsed)) / 1e18;

      return {
        hash: tx.hash,
        timestamp: dayjs.unix(tx.timeStamp).format('YYYY-MM-DD HH:mm:ss'),
        from: tx.from,
        to: tx.to,
        type: 'ETH Transfer',
        contract: '',
        symbol: 'ETH',
        tokenId: '',
        value: valueEth.toFixed(6),
        gasFee: gasFeeEth.toFixed(6),
      };
    });

    const erc20Records = erc20Txs.map((tx) => ({
      hash: tx.hash,
      timestamp: dayjs.unix(tx.timeStamp).format('YYYY-MM-DD HH:mm:ss'),
      from: tx.from,
      to: tx.to,
      type: 'ERC-20',
      contract: tx.contractAddress,
      symbol: tx.tokenSymbol,
      tokenId: '',
      value: (parseFloat(tx.value ?? 0) / Math.pow(10, tx.tokenDecimal ?? 0)).toFixed(6),
      gasFee: '',
    }));

    const erc721Records = erc721Txs.map((tx) => ({
      hash: tx.hash,
      timestamp: dayjs.unix(tx.timeStamp).format('YYYY-MM-DD HH:mm:ss'),
      from: tx.from,
      to: tx.to,
      type: 'ERC-721',
      contract: tx.contractAddress,
      symbol: tx.tokenName,
      tokenId: tx.tokenID,
      value: '1', // NFTs are always 1 unit
      gasFee: '',
    }));

    const allTxs = [...ethRecords, ...erc20Records, ...erc721Records];

    await exportToCsv(allTxs);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
