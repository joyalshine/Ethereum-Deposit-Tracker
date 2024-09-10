# Ethereum Deposit Tracker

This project provides a real-time and historical view of Ethereum deposits to a specific contract. It features a backend service that tracks Ethereum deposits using WebSockets and an API, and a frontend application that displays real-time and historical deposit data.

## Project Structure

### Backend

- **`server.js`**: Sets up the Express server and initializes the WebSocket server.
- **`routes/historicalRoutes.js`**: Contains routes for fetching historical deposit data.
- **`services/websocketService.js`**: Manages WebSocket connections and tracks Ethereum deposits.
- **`services/telegramServices.js`**: Sends notifications to Telegram when a new deposit is detected.
- **`package.json`**: Defines project dependencies and scripts.

### Frontend

- **`App.js`**: React component that displays real-time and historical deposit data.
- **`App.css`**: Styles for the frontend application.
- **`index.js`**: Entry point for the React application.
- **`package.json`**: Defines frontend dependencies and scripts.

## Getting Started

### Prerequisites

- Node.js and npm installed.
- Access to an Ethereum RPC URL.
- Telegram Bot API Key and Chat ID for notifications.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/your-repository.git
   cd your-repository
   ```

2. **Backend Setup:**

   - Navigate to the backend directory:

     ```bash
     cd backend
     ```

   - Install dependencies:

     ```bash
     npm install
     ```

   - Create a `.env` file in the `backend` directory and add the following environment variables:

     ```
     PORT=5000
     ETH_RPC_URL=your_ethereum_rpc_url
     TELEGRAM_API_KEY=your_telegram_bot_api_key
     TELEGRAM_CHAT_ID=your_telegram_chat_id
     ```

   - Start the backend server:

     ```bash
     npm start
     ```

3. **Frontend Setup:**

   - Navigate to the frontend directory:

     ```bash
     cd frontend
     ```

   - Install dependencies:

     ```bash
     npm install
     ```

   - Start the React application:

     ```bash
     npm start
     ```

### Hosted Application

- **Frontend**: [https://ethereum-deposit-tracker.vercel.app](https://ethereum-deposit-tracker.vercel.app)
- **Backend**: [https://ethereum-deposit-tracker.onrender.com](https://ethereum-deposit-tracker.onrender.com)

### Usage

- **Real-Time Data**: The frontend application connects to the WebSocket server to display new deposits in real-time.
- **Historical Data**: Fetch past deposit data by selecting the "Past 200 Blocks" tab on the frontend.

### Testing

- The backend provides a WebSocket endpoint for real-time deposit notifications and an HTTP endpoint (`/historical`) for fetching historical deposit data.
- The frontend allows switching between real-time and historical views, and displays transaction details in a table.

