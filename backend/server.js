/**
 * AAMS Mock API Server Template
 * Use this as a starting point to build a Node.js + Express backend with database persistence.
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock DB State (Representing database rows)
let defaultRentAmount = 5000;
let rentRecords = [];
let guesthouseRentRecords = [];

// Get Default Rent Setting
app.get('/api/settings/rent', (req, res) => {
  res.json({ defaultRentAmount });
});

// Update Default Rent Setting
app.post('/api/settings/rent', (req, res) => {
  const { amount } = req.body;
  defaultRentAmount = parseFloat(amount) || 0;
  res.json({ success: true, defaultRentAmount });
});

// Get Rent Records for billing month/year
app.get('/api/rent/records', (req, res) => {
  const { month, year } = req.query;
  const filtered = rentRecords.filter(
    (r) => r.month === parseInt(month) && r.year === parseInt(year)
  );
  res.json(filtered);
});

// Log/Collect Rent Payment
app.post('/api/rent/payment', (req, res) => {
  const { buildingCode, roomNo, residentName, month, year, amountPaid, notes } = req.body;

  const id = `${buildingCode}-${roomNo}-${month}-${year}`;
  const existingIdx = rentRecords.findIndex((r) => r.id === id);

  const rentAmount = defaultRentAmount;
  const carryForwardAmount = 0; // In real DB, query previous month's balance
  const totalDue = rentAmount + carryForwardAmount;
  const balance = totalDue - amountPaid;
  const status = balance <= 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Unpaid';

  const newRecord = {
    id,
    buildingCode,
    roomNo,
    residentName,
    month,
    year,
    rentAmount,
    carryForwardAmount,
    amountPaid,
    balance,
    status,
    notes,
    paidDate: new Date().toISOString().split('T')[0]
  };

  if (existingIdx !== -1) {
    rentRecords[existingIdx] = newRecord;
  } else {
    rentRecords.push(newRecord);
  }

  res.json({ success: true, record: newRecord });
});

// Start Server
app.listen(PORT, () => {
  console.log(`AAMS Server running on port ${PORT}`);
});
