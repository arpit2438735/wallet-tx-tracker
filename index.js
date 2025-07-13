require('dotenv').config();
const etherscanApi = require('etherscan-api').init(process.env.ETHERSCAN_API_KEY);
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const dayjs = require('dayjs');

const address = '0xa39b189482f984388a34460636fea9eb181ad1a6';

async function fetchNormalTransactions(walletAddress) {
  const response = await etherscanApi.account.txlist(walletAddress, 1, 'latest', 1, 10000, 'asc');
  return response.result || [];
}

async function exportToCsv(transactions) {
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

  const rows = transactions.map(tx => {
    // Convert value from wei to ETH by dividing by 10^18
    const valueEth = parseFloat(tx.value) / 1e18;
    const gasFeeEth = (parseFloat(tx.gasPrice) * parseFloat(tx.gasUsed)) / 1e18;

    return {
      hash: tx.hash,
      timestamp: dayjs.unix(tx.timeStamp).format('YYYY-MM-DD HH:mm:ss'),
      from: tx.from,
      to: tx.to,
      type: 'ETH Transfer',
      value: valueEth.toFixed(6),
      gasFee: gasFeeEth.toFixed(6),
    };
  });

  await csvWriter.writeRecords(rows);
  console.log(`Exported ${rows.length} transactions to data/transactions.csv`);
}

(async () => {
  try {
    const txs = await fetchNormalTransactions(address);
    await exportToCsv(txs);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
