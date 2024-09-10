import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [deposits, setDeposits] = useState([]);
  const [view, setView] = useState('realtime');
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);

  const BEACON_ADDRESS = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
  
  useEffect(() => {
    if (view === 'realtime') {
      setHistoricalData([]);

      const ws = new WebSocket('ws://ethereum-deposit-tracker.onrender.com:5000');

      ws.onopen = () => {
        console.log('Connected to WebSocket');
      };

      ws.onmessage = (event) => {
        const newDeposit = JSON.parse(event.data);
        setDeposits((prevDeposits) => [newDeposit, ...prevDeposits]);
      };

      ws.onclose = () => {
        console.log('Disconnected from WebSocket');
      };

      return () => {
        ws.close();
      };
    } else if (view === 'historical') {
      setDeposits([]);
      setLoading(true);

      fetch('https://ethereum-deposit-tracker.onrender.com/historical')
        .then((response) => response.json())
        .then((data) => {
          setHistoricalData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching historical data:', error);
          setLoading(false);
        });
    }
  }, [view]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getRowClassName = (toAddress) => {
    if (toAddress.toLowerCase() === BEACON_ADDRESS.toLowerCase()) {
      return 'normal-transaction';
    }
    return 'internal-transaction';
  };

  return (
    <div className="App">
      <header>
        <h1>Ethereum Deposit Tracker</h1>
        <div className="tabs">
          <button
            className={view === 'realtime' ? '' : 'active'}
            onClick={() => setView('realtime')}
          >
            Real-Time Data
          </button>
          <button
            className={view === 'historical' ? '' : 'active'}
            onClick={() => setView('historical')}
          >
            Past 200 Blocks
          </button>
        </div>
      </header>
      <main>
        <div className="legend">
          <p><span className="normal-transaction-legend"></span> Normal Transaction</p>
          <p><span className="internal-transaction-legend"></span> Internal Transaction</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Block Number</th>
              <th>Block Timestamp</th>
              <th>From</th>
              <th>To</th>
              <th>Fee (ETH)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading">
                  <div className="spinner"></div>
                </td>
              </tr>
            ) : view === 'realtime' && deposits.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">Waiting for Transactions</td>
              </tr>
            ) : view === 'historical' && historicalData.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No Transactions</td>
              </tr>
            ) : (view === 'realtime' ? deposits : historicalData).map((deposit, index) => (
              <tr key={index} className={getRowClassName(deposit.to)}>
                <td width="15%">{deposit.blockNumber}</td>
                <td>{formatTimestamp(deposit.blockTimestamp)}</td>
                <td>{deposit.from}</td>
                <td>{deposit.to}</td>
                <td>{deposit.fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default App;



