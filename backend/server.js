const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const historicalRoutes = require('./routes/historicalRoutes');
const { initializeWebSocketServer } = require('./services/websocketService');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;

app.use('/', historicalRoutes);

const server = http.createServer(app);
initializeWebSocketServer(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});





