const { getDb } = require('../shared/dbConnection');
const dayjs = require('dayjs');
const logger = require('../shared/logger'); 

async function createEntry({ name, email, created_at }) {
  logger.info(`createEntry called with name=${name}, email=${email}, created_at=${created_at}`);

  if (!name) {
    const err = new Error(`Invalid input: name is missing`);
    err.code = 'MISSING_NAME';
    err.statusCode = 400;
    logger.warn({ err }, 'Missing Name');
    return err;
  }

  if (!email) {
    const err = new Error(`Invalid input: email is missing`);
    err.code = 'MISSING_EMAIL';
    err.statusCode = 400;
    logger.warn({ err }, 'Missing email');
    return err;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const err = new Error(`Invalid email format: ${email}`);
    err.code = 'INVALID_EMAIL_FORMAT';
    err.statusCode = 400;
    logger.warn({ err }, 'Invalid email format');
    return err;
  }

  const db = getDb();
  const startOfMonth = dayjs(created_at).startOf('month').toISOString();
  const endOfMonth = dayjs(created_at).endOf('month').toISOString();

  const existing = await db.get(
    'SELECT * FROM entries WHERE email = ? AND created_at >= ? AND created_at <= ?',
    email,
    startOfMonth,
    endOfMonth
  );

  if (existing) {
    const err = new Error(`${email} has already signed up this month`);
    err.code = 'DUPLICATE_EMAIL_MONTH';
    err.statusCode = 400;
    logger.error({ email, created_at }, 'Failed to create entry due to duplicate');
    return err;
  }

  const res = await db.run(
    'INSERT INTO entries (name, email, created_at) VALUES (?, ?, ?)',
    name,
    email,
    created_at
  );

  logger.info({ id: res.lastID, name, email, created_at }, 'Entry successfully created');
  return { id: res.lastID, name, email, created_at };
}

async function getEntries({ from }) {
  const db = getDb();
  logger.info(`getEntries called with from=${from}`);
  if (from) {
    return db.all('SELECT * FROM entries WHERE created_at >= ?', from);
  }
  return db.all('SELECT * FROM entries');
}

module.exports = { createEntry, getEntries };