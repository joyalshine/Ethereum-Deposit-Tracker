const WebSocket = require('ws');
const { ethers } = require('ethers');
const { sendTelegramMessage } = require('./telegramServices');

const BEACON_CONTRACT_ADDRESS = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

let ws = null;

const decodePubkey = (data) => {
    return `0x${data.slice(0, 96)}`;
};


const trackDeposit = () => {
    provider.on({ address: BEACON_CONTRACT_ADDRESS }, async (log) => {
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

            console.log("Transaction detected");

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(depositData));
            }
            // sendTelegramMessage(depositData);

        } catch (err) {
            console.error('Error processing log:', err);
        }
    });
};

const initializeWebSocketServer = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (wsNew) => {
        console.log('Client connected');
        ws = wsNew;
        wsNew.on('close', () => {
            console.log('Client disconnected');
            ws = null;
        });
    });

    trackDeposit();
};

module.exports = {
    initializeWebSocketServer,
};
