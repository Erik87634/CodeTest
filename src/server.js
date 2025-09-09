require('dotenv').config();
const express = require('express');
const app = express();
const LotteryRoutes = require('./routes/routes');

app.use(express.json());
app.use('/api/lottery', LotteryRoutes);

const PORT = process.env.PORT || 3000;

// Only start the HTTP server when this file is run directly.
// This prevents a persistent server when the module is required in tests.
if (require.main === module) {
  const { initDb } = require('./shared/dbConnection');
  initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  });
}

module.exports = app;
