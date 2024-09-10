const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const ETH_RPC_URL = process.env.ETH_RPC_URL;
const BEACON_CONTRACT_ADDRESS = "0x00000000219ab540356cBB839Cbe05303d7705Fa";

const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const trackDeposit = async (ws) => {
    try {
        const latestBlock = await provider.getBlockNumber();
        const filter = {
            address: BEACON_CONTRACT_ADDRESS,
            fromBlock: latestBlock - 100,
            toBlock: 'latest',
        };

        provider.on(filter, async (log) => {
            try {
                const transaction = await provider.getTransaction(log.transactionHash);
                const block = await provider.getBlock(log.blockNumber);
                const receipt = await provider.getTransactionReceipt(log.transactionHash);

                const gasUsed = BigInt(receipt.gasUsed);
                const gasPrice = transaction.gasPrice ? transaction.gasPrice : BigInt(0);
                const fee = gasUsed * gasPrice;

                const pubkey = decodePubkey(log.data);

                const depositData = {
                    blockNumber: log.blockNumber,
                    blockTimestamp: block.timestamp,
                    fee: ethers.formatUnits(fee, 'ether'),
                    hash: log.transactionHash,
                    pubkey: pubkey,
                    from: transaction.from,   // From address
                    to: transaction.to        // To address
                };

                console.log(depositData)

                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(depositData));
                }
            } catch (err) {
                console.error('Error processing log:', err);
            }
        });
    } catch (err) {
        console.error("Error fetching deposit data:", err);
    }
};

const decodePubkey = (data) => {
    return `0x${data.slice(0, 96)}`;
};

wss.on('connection', (ws) => {
    console.log('Client connected');
    trackDeposit(ws);
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



