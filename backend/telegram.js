const axios = require("axios");
require("dotenv").config(); // Load environment variables

const sendTelegramMessage = async (deposit) => {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `New ETH Deposit Detected:\nBlock: ${deposit.blockNumber}\nTransaction Hash: ${deposit.hash}\nTimestamp: ${deposit.blockTimestamp}`,
      }
    );
    // console.log("Telegram response:", response.data);
    console.log("Message Sent")
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

module.exports = {sendTelegramMessage}