const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const ETH_RPC_URL = process.env.ETH_RPC_URL;
const BEACON_CONTRACT_ADDRESS = "0x00000000219ab540356cBB839Cbe05303d7705Fa";

const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);

// const trackDeposit = async () => {
//     try {
//         const latestBlock = await provider.getBlockNumber();
//         console.log('Latest block:', latestBlock);

//         const filter = {
//             address: BEACON_CONTRACT_ADDRESS,
//             fromBlock: latestBlock - 100, // Increased block range for testing
//             toBlock: 'latest',
//         };

//         const logs = await provider.getLogs(filter);
//         console.log('Fetched logs:', logs.length);
//         console.log('Fetched logs:', logs.length);

//         if (logs.length === 0) {
//             console.log('No logs found for the specified range.');
//         }

//         //   const log = logs[0]
//         const depositData = await Promise.all(logs.map(async (log) => {
//             try {
//                 const transaction = await provider.getTransaction(log.transactionHash);
//                 const block = await provider.getBlock(log.blockNumber);
//                 const receipt = await provider.getTransactionReceipt(log.transactionHash);

//                 console.log("============================================================")
//                 console.log(transaction)
//                 // console.log(block)
//                 // console.log(receipt)
//                 const transactionCount = block.transactions.length;

//                 console.log(`Block Number: ${log.blockNumber}`);
//                 console.log(`Number of Transactions: ${transactionCount}`);

//                 let gasUsed = BigInt(receipt.gasUsed);
//                 const gasPrice = transaction.gasPrice ? transaction.gasPrice : BigInt(0);

//                 const fee = gasUsed * gasPrice;

//                 return {
//                     blockNumber: log.blockNumber,
//                     transactionHash: log.transactionHash,
//                     sender: log.address,
//                     data: log.data,
//                     timestamp: block.timestamp,
//                     fee: ethers.formatUnits(fee, 'ether')
//                 };
//             } catch (err) {
//                 console.error('Error processing log:', err);
//                 return null;
//             }
//         }));

//         // Filter out any null entries that may have been returned due to errors
//         return depositData.filter(item => item !== null);
//     } catch (err) {
//         console.error("Error fetching deposit data:", err);
//         return [];
//     }
// };


const trackDeposit = async () => {
    try {
        const latestBlock = await provider.getBlockNumber();
        console.log('Latest block:', latestBlock);

        const filter = {
            address: BEACON_CONTRACT_ADDRESS,
            fromBlock: latestBlock - 100, // Increased block range for testing
            toBlock: 'latest',
        };

        const logs = await provider.getLogs(filter);
        console.log('Fetched logs:', logs.length);

        if (logs.length === 0) {
            console.log('No logs found for the specified range.');
            return [];
        }

        const depositData = await Promise.all(logs.map(async (log) => {
            try {
                const transaction = await provider.getTransaction(log.transactionHash);
                const block = await provider.getBlock(log.blockNumber);
                const receipt = await provider.getTransactionReceipt(log.transactionHash);

                console.log("============================================================");
                console.log(transaction);

                const transactionCount = block.transactions.length;
                console.log(`Block Number: ${log.blockNumber}`);
                console.log(`Number of Transactions: ${transactionCount}`);

                let gasUsed = BigInt(receipt.gasUsed);
                const gasPrice = transaction.gasPrice ? transaction.gasPrice : BigInt(0);
                const fee = gasUsed * gasPrice;

                // Decode pubkey from the log data (this will vary based on the log data structure)
                const pubkey = decodePubkey(log.data);

                return {
                    blockNumber: log.blockNumber,
                    blockTimestamp: block.timestamp,
                    fee: ethers.formatUnits(fee, 'ether'),
                    hash: log.transactionHash,
                    pubkey: pubkey
                };
            } catch (err) {
                console.error('Error processing log:', err);
                return null;
            }
        }));

        // Filter out any null entries that may have been returned due to errors
        return depositData.filter(item => item !== null);
    } catch (err) {
        console.error("Error fetching deposit data:", err);
        return [];
    }
};

// Helper function to decode pubkey from log data (you will need to adjust this based on the data structure)
const decodePubkey = (data) => {
    // Assuming the pubkey is the first 48 bytes of the log data
    return `0x${data.slice(0, 96)}`;
};



app.get('/deposits', async (req, res) => {
    const depositData = await trackDeposit();
    //   console.log(depositData)
    res.json(depositData);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




































