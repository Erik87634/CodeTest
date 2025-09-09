const winnerService = require('../src/services/winnerService');
const { getDb } = require('../src/shared/dbConnection');
const logger = require('../src/shared/logger');

jest.mock('../src/shared/dbConnection');
jest.mock('../src/shared/logger');

describe('winnerService', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      run: jest.fn().mockResolvedValue({}),
    };
    getDb.mockReturnValue(mockDb);
  });

  describe('drawWinner', () => {
    it('should draw a winner successfully', async () => {
      const mockEntries = [
        { id: 1, name: 'Alice', email: 'alice@example.com', created_at: '2025-09-01T12:00:00Z' },
        { id: 2, name: 'Bob', email: 'bob@example.com', created_at: '2025-09-02T12:00:00Z' },
      ];
      mockDb.all.mockResolvedValue(mockEntries);

      const result = await winnerService.drawWinner();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(mockDb.run).toHaveBeenCalled();
    });

    it('should return error if no participants', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await winnerService.drawWinner();

      expect(result).toBeInstanceOf(Error);
      expect(result.code).toBe('NO_PARTICIPANTS');
    });
  });

  describe('drawWinners', () => {
    it('should draw multiple unique winners successfully', async () => {
      const mockEntries = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com' },
      ];
      mockDb.all.mockResolvedValue(mockEntries);

      const result = await winnerService.drawWinners(2);

      expect(result).toHaveLength(2);
      expect(mockDb.run).toHaveBeenCalledTimes(2);
    });

    it('should return error if not enough unique participants', async () => {
      const mockEntries = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Alice Clone', email: 'alice@example.com' },
      ];
      mockDb.all.mockResolvedValue(mockEntries);

      const result = await winnerService.drawWinners(2);

      expect(result).toBeInstanceOf(Error);
      expect(result.code).toBe('INSUFFICIENT_PARTICIPANTS');
    });

    it('should return error if no participants', async () => {
      mockDb.all.mockResolvedValue([]);

      const result = await winnerService.drawWinners(1);

      expect(result).toBeInstanceOf(Error);
      expect(result.code).toBe('NO_PARTICIPANTS');
    });
  });

  describe('getWinners', () => {
    it('should return list of winners', async () => {
      const mockWinners = [
        { id: 1, name: 'Alice', email: 'alice@example.com', drawn_at: '2025-09-01T12:00:00Z' },
      ];
      mockDb.all.mockResolvedValue(mockWinners);

      const result = await winnerService.getWinners();

      expect(result).toEqual(mockWinners);
      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM winners ORDER BY drawn_at DESC');
    });
  });
});
