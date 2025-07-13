const axios = require('axios');

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPaginatedTxs(urlBuilder) {
  const allResults = [];
  let page = 1;
  const offset = 10000;

  while (true) {
    const url = urlBuilder(page, offset);
    const response = await axios.get(url);
    const result = response.data.result || [];

    allResults.push(...result);
    console.log(`Fetched page ${page} with ${result.length} transactions`);

    if (result.length < offset) break;
    page++;
    await delay(1100);
  }

  return allResults;
}

module.exports = { fetchPaginatedTxs };
