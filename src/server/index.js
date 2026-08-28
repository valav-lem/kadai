require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('select now()', (err, result) => {
  if (err) {
    return console.error('Error connecting to Postgres:', err.stack);
  }
  console.log('Postgres connected at:', result.rows[0].now);
});

app.get('/', (req, res) => {
  res.send('Kadai Backend API is running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
