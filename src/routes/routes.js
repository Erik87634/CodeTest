const express = require('express');
const router = express.Router();
const entryService = require('../services/entryService');
const winnerService = require('../services/winnerService');

router.post('/entries', async (req, res) => {
  const now = new Date().toISOString();
  const result = await entryService.createEntry({ ...req.body, created_at: now });
  if (result instanceof Error) {
    return res.status(result.statusCode).json({ message: result.message });
  }
  res.status(201).json(result);
});

router.get('/entries', async (req, res) => {
  const from = req.query.from;
  const result = await entryService.getEntries({ from });
  res.json(result);
});

router.post('/draw', async (req, res) => {
  console.log("number of winners: " + req.body.numberOfWinners);
  if ('numberOfWinners' in req.body && Number.isInteger(req.body.numberOfWinners)) {
    console.log("im in the correct if statement.")
    const result = await winnerService.drawWinners(req.body.numberOfWinners);
    if (result instanceof Error) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    res.json(result);
  }
  else {
    console.log("im going in here for some reason.")
    const result = await winnerService.drawWinner();
    if (result instanceof Error) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    res.json(result);
  }
});

router.get('/winners', async (req, res) => {
  const result = await winnerService.getWinners();
  res.json(result);
});

module.exports = router;
