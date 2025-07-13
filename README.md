# 🧾 ETH Transaction Exporter

A Node.js script that fetches and exports Ethereum wallet transaction history into a clean CSV file.  
It supports **ETH transfers**, **ERC-20 token transfers**, and **ERC-721 NFT transfers**.

---

## 🚀 Features

- ✅ Normal ETH transfers
- ✅ ERC-20 token transfers (e.g., USDT, USDC)
- ✅ ERC-721 NFT transfers (e.g., BAYC, Azuki)
- ✅ Unified CSV export with:
  - Transaction Hash
  - Date & Time
  - From / To
  - Type (ETH, ERC-20, ERC-721)
  - Token Symbol / Name
  - Token ID (for NFTs)
  - Gas Fees (for ETH transfers)

---

## 📦 Installation

```bash
npm install


🛠 Usage

🔸 Command to Run
```bash
node index.js <your_ethereum_wallet_address>

🔸 Example
```bash
node index.js 0xa39b189482f984388a34460636fea9eb181ad1a6

The script will output a file at:
```bash
data/transactions.csv