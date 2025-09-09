const { getDb } = require('../shared/dbConnection');
const dayjs = require('dayjs');
const logger = require('../shared/logger'); 

async function drawWinner() {
  const db = getDb();
  const drawTime = new Date().toISOString();
  const startOfMonth = dayjs(drawTime).startOf('month').toISOString();

  logger.info(`drawWinner called at ${drawTime}`);

  const entries = await db.all(
    'SELECT * FROM entries WHERE created_at >= ? AND created_at <= ?',
    startOfMonth,
    drawTime
  );

  if (!entries || entries.length === 0) {
    const err = new Error('No valid participants');
    err.code = 'NO_PARTICIPANTS';
    err.statusCode = 404;
    logger.warn('No participants found for draw');
    return err;
  }

  const idx = Math.floor(Math.random() * entries.length);
  const winner = entries[idx];

  await db.run(
    'INSERT INTO winners (entry_id, name, email, drawn_at) VALUES (?, ?, ?, ?)',
    winner.id,
    winner.name,
    winner.email,
    drawTime
  );

  logger.info({ winner, drawn_at: drawTime }, 'Winner drawn');
  return { ...winner, drawn_at: drawTime };
}

async function drawWinners(numberOfWinners) {
  const db = getDb();
  const drawTime = new Date().toISOString();
  const startOfMonth = dayjs(drawTime).startOf('month').toISOString();

  logger.info(`drawWinners called at ${drawTime} for ${numberOfWinners} winners`);

  const entries = await db.all(
    'SELECT * FROM entries WHERE created_at >= ? AND created_at <= ?',
    startOfMonth,
    drawTime
  );

  if (!entries || entries.length === 0) {
    const err = new Error('No valid participants');
    err.code = 'NO_PARTICIPANTS';
    err.statusCode = 404;
    logger.warn('No participants found for draw');
    return err;
  }

  const uniqueEntriesMap = new Map();
  for (const entry of entries) {
    if (!uniqueEntriesMap.has(entry.email)) {
      uniqueEntriesMap.set(entry.email, entry);
    }
  }

  const uniqueEntries = Array.from(uniqueEntriesMap.values());

  if (uniqueEntries.length < numberOfWinners) {
    const err = new Error(`Not enough unique participants to draw ${numberOfWinners} winners`);
    err.code = 'INSUFFICIENT_PARTICIPANTS';
    err.statusCode = 400;
    logger.warn(err.message);
    return err;
  }

  const shuffledEntries = shuffleArray(uniqueEntries);
  const selectedWinners = shuffledEntries.slice(0, numberOfWinners);

  for (const winner of selectedWinners) {
    await db.run(
      'INSERT INTO winners (entry_id, name, email, drawn_at) VALUES (?, ?, ?, ?)',
      winner.id,
      winner.name,
      winner.email,
      drawTime
    );
  }

  logger.info({ winners: selectedWinners, drawn_at: drawTime }, 'Winners drawn');
  return selectedWinners.map(w => ({ ...w, drawn_at: drawTime }));
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}



async function getWinners() {
  const db = getDb();
  logger.info('listWinners called');
  return db.all('SELECT * FROM winners ORDER BY drawn_at DESC');
}

module.exports = { drawWinner, drawWinners, getWinners };