import { DateUtils } from './date-utils';

describe('DateUtils', () => {
  describe('pad2', () => {
    it('should pad single digit numbers with leading zero', () => {
      expect(DateUtils.pad2(1)).toBe('01');
      expect(DateUtils.pad2(5)).toBe('05');
      expect(DateUtils.pad2(9)).toBe('09');
    });

    it('should not pad double digit numbers', () => {
      expect(DateUtils.pad2(10)).toBe('10');
      expect(DateUtils.pad2(25)).toBe('25');
      expect(DateUtils.pad2(99)).toBe('99');
    });

    it('should handle zero', () => {
      expect(DateUtils.pad2(0)).toBe('00');
    });

    it('should handle large numbers', () => {
      expect(DateUtils.pad2(123)).toBe('23'); // Takes last 2 digits
      expect(DateUtils.pad2(999)).toBe('99'); // Takes last 2 digits
    });
  });

  describe('buildDateCommand', () => {
    it('should build date command in correct format', () => {
      const testDate = new Date(2023, 11, 25, 14, 30, 45); // Dec 25, 2023 14:30:45
      const result = DateUtils.buildDateCommand(testDate);
      
      expect(result).toBe('sudo date 122514302023.45');
    });

    it('should handle single digit month and day', () => {
      const testDate = new Date(2023, 0, 5, 9, 5, 7); // Jan 5, 2023 09:05:07
      const result = DateUtils.buildDateCommand(testDate);
      
      expect(result).toBe('sudo date 010509052023.07');
    });

    it('should handle midnight', () => {
      const testDate = new Date(2023, 5, 15, 0, 0, 0); // Jun 15, 2023 00:00:00
      const result = DateUtils.buildDateCommand(testDate);
      
      expect(result).toBe('sudo date 061500002023.00');
    });

    it('should handle end of day', () => {
      const testDate = new Date(2023, 11, 31, 23, 59, 59); // Dec 31, 2023 23:59:59
      const result = DateUtils.buildDateCommand(testDate);
      
      expect(result).toBe('sudo date 123123592023.59');
    });

    it('should handle leap year', () => {
      const testDate = new Date(2024, 1, 29, 12, 30, 15); // Feb 29, 2024 12:30:15
      const result = DateUtils.buildDateCommand(testDate);
      
      expect(result).toBe('sudo date 022912302024.15');
    });
  });

  describe('getCurrentDateTime', () => {
    it('should return current date and time', () => {
      const before = new Date();
      const result = DateUtils.getCurrentDateTime();
      const after = new Date();
      
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should return a new Date instance', () => {
      const result1 = DateUtils.getCurrentDateTime();
      const result2 = DateUtils.getCurrentDateTime();
      
      expect(result1).not.toBe(result2);
      expect(result1.getTime()).toBeLessThanOrEqual(result2.getTime());
    });
  });

  describe('generateTimezoneCommand', () => {
    it('should generate timezone command with default timezone', () => {
      const result = DateUtils.generateTimezoneCommand();
      
      expect(result).toBe('sudo timedatectl set-timezone Asia/Tokyo');
    });

    it('should generate timezone command with custom timezone', () => {
      const result = DateUtils.generateTimezoneCommand('UTC');
      
      expect(result).toBe('sudo timedatectl set-timezone UTC');
    });

    it('should generate timezone command with Europe timezone', () => {
      const result = DateUtils.generateTimezoneCommand('Europe/London');
      
      expect(result).toBe('sudo timedatectl set-timezone Europe/London');
    });

    it('should generate timezone command with America timezone', () => {
      const result = DateUtils.generateTimezoneCommand('America/New_York');
      
      expect(result).toBe('sudo timedatectl set-timezone America/New_York');
    });
  });

  describe('generateHistoryControlCommand', () => {
    it('should generate history control command', () => {
      const result = DateUtils.generateHistoryControlCommand();
      
      expect(result).toBe('HISTCONTROL=ignoreboth');
    });

    it('should always return the same command', () => {
      const result1 = DateUtils.generateHistoryControlCommand();
      const result2 = DateUtils.generateHistoryControlCommand();
      
      expect(result1).toBe(result2);
      expect(result1).toBe('HISTCONTROL=ignoreboth');
    });
  });

  describe('integration tests', () => {
    it('should work together for a complete date setup scenario', () => {
      const currentDate = DateUtils.getCurrentDateTime();
      const dateCommand = DateUtils.buildDateCommand(currentDate);
      const timezoneCommand = DateUtils.generateTimezoneCommand();
      const historyCommand = DateUtils.generateHistoryControlCommand();
      
      expect(dateCommand).toMatch(/^sudo date \d{8}\d{4}\.\d{2}$/);
      expect(timezoneCommand).toBe('sudo timedatectl set-timezone Asia/Tokyo');
      expect(historyCommand).toBe('HISTCONTROL=ignoreboth');
    });

    it('should handle edge case dates correctly', () => {
      // January 1st, 2000 00:00:00
      const edgeDate = new Date(2000, 0, 1, 0, 0, 0);
      const result = DateUtils.buildDateCommand(edgeDate);
      
      expect(result).toBe('sudo date 010100002000.00');
    });
  });
});
