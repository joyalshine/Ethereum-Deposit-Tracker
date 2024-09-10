const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');


const BEACON_CONTRACT_ADDRESS = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
console.log(process.env.ETH_RPC_URL)
const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

const decodePubkey = (data) => {
    return `0x${data.slice(0, 96)}`;
};
router.get('/historical', async (req, res) => {
    try {
        const latestBlock = await provider.getBlockNumber();
        const filter = {
            address: BEACON_CONTRACT_ADDRESS,
            fromBlock: latestBlock - 100,
            toBlock: 'latest',
        };

        const logs = await provider.getLogs(filter);
        const transactions = await Promise.all(logs.map(async (log) => {
            try {
                const transaction = await provider.getTransaction(log.transactionHash);
                const block = await provider.getBlock(log.blockNumber);
                const receipt = await provider.getTransactionReceipt(log.transactionHash);

                const gasUsed = BigInt(receipt.gasUsed);
                const gasPrice = transaction.gasPrice ? transaction.gasPrice : BigInt(0);
                const fee = gasUsed * gasPrice;

                const pubkey = decodePubkey(log.data);

                return {
                    blockNumber: log.blockNumber,
                    blockTimestamp: block.timestamp,
                    fee: ethers.formatUnits(fee, 'ether'),
                    hash: log.transactionHash,
                    pubkey: pubkey,
                    from: transaction.from,
                    to: transaction.to
                };
            } catch (error) {
                console.error(`Error processing log ${log.transactionHash}:`, error);
                return null;
            }
        }));

        const validTransactions = transactions.filter(tx => tx !== null);

        res.json(validTransactions);
    } catch (err) {
        console.error("Error fetching historical data:", err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
