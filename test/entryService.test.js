const entryService = require('../src/services/entryService');
const { getDb } = require('../src/shared/dbConnection');
const logger = require('../src/shared/logger');

jest.mock('../src/shared/dbConnection');
jest.mock('../src/shared/logger');

describe('createEntry', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      get: jest.fn(),
      run: jest.fn().mockResolvedValue({ lastID: 1 }),
    };
    getDb.mockReturnValue(mockDb);
  });

  it('should create an entry successfully', async () => {
    mockDb.get.mockResolvedValue(null); // No existing entry

    const result = await entryService.createEntry({
      name: 'Alice',
      email: 'alice@example.com',
      created_at: '2025-09-01T12:00:00Z',
    });

    expect(result).toEqual({
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      created_at: '2025-09-01T12:00:00Z',
    });

    expect(mockDb.run).toHaveBeenCalled();
  });

  it('should fail if name is missing', async () => {
    const result = await entryService.createEntry({
      email: 'alice@example.com',
      created_at: '2025-09-01T12:00:00Z',
    });

    expect(result).toBeInstanceOf(Error);
    expect(result.code).toBe('MISSING_NAME');
  });

  it('should fail if email is missing', async () => {
    const result = await entryService.createEntry({
      name: 'Alice',
      created_at: '2025-09-01T12:00:00Z',
    });

    expect(result).toBeInstanceOf(Error);
    expect(result.code).toBe('MISSING_EMAIL');
  });

  it('should fail if email format is invalid', async () => {
    const result = await entryService.createEntry({
      name: 'Alice',
      email: 'invalid-email',
      created_at: '2025-09-01T12:00:00Z',
    });

    expect(result).toBeInstanceOf(Error);
    expect(result.code).toBe('INVALID_EMAIL_FORMAT');
  });

  it('should fail if email already exists this month', async () => {
    mockDb.get.mockResolvedValue({ id: 99 }); // Simulate existing entry

    const result = await entryService.createEntry({
      name: 'Alice',
      email: 'alice@example.com',
      created_at: '2025-09-01T12:00:00Z',
    });

    expect(result).toBeInstanceOf(Error);
    expect(result.code).toBe('DUPLICATE_EMAIL_MONTH');
  });
});
