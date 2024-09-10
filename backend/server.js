const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const {sendTelegramMessage} = require("./telegram")

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const ETH_RPC_URL = process.env.ETH_RPC_URL;
const BEACON_CONTRACT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
// const BEACON_CONTRACT_ADDRESS = "0x00000000219ab540356cBB839Cbe05303d7705Fa";

const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


const decodePubkey = (data) => {
    return `0x${data.slice(0, 96)}`;
};

app.get('/historical', async (req, res) => {
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

                const details = {
                    blockNumber: log.blockNumber,
                    blockTimestamp: block.timestamp,
                    fee: ethers.formatUnits(fee, 'ether'),
                    hash: log.transactionHash,
                    pubkey: pubkey,
                    from: transaction.from,
                    to: transaction.to
                };
                console.log("===================")
                console.log(details)

                return details;
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

let ws = null;

const trackDeposit = async () => {
    try {
        const latestBlock = await provider.getBlockNumber();
        const filter = {
            address: BEACON_CONTRACT_ADDRESS,
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
                    from: transaction.from,
                    to: transaction.to
                };
                console.log("Transaction detected")

                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(depositData));
                }
                sendTelegramMessage(depositData);

            } catch (err) {
                console.error('Error processing log:', err);
            }
        });
    } catch (err) {
        console.error("Error fetching deposit data:", err);
    }
};
trackDeposit()

wss.on('connection', (wsNew) => {
    console.log('Client connected');
    // trackDeposit(ws);
    ws = wsNew
    wsNew.on('close', () => {
        console.log('Client disconnected');
        ws = null;
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




