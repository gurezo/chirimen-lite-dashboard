import { ErrorHandler } from './error-handler';

describe('ErrorHandler', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('getErrorMessage', () => {
    it('should return error message for Error instances', () => {
      const error = new Error('Test error message');
      const result = ErrorHandler.getErrorMessage(error);
      
      expect(result).toBe('Test error message');
    });

    it('should return "Unknown error" for non-Error instances', () => {
      const result1 = ErrorHandler.getErrorMessage('string error');
      const result2 = ErrorHandler.getErrorMessage(123);
      const result3 = ErrorHandler.getErrorMessage(null);
      const result4 = ErrorHandler.getErrorMessage(undefined);
      const result5 = ErrorHandler.getErrorMessage({ custom: 'error' });
      
      expect(result1).toBe('Unknown error');
      expect(result2).toBe('Unknown error');
      expect(result3).toBe('Unknown error');
      expect(result4).toBe('Unknown error');
      expect(result5).toBe('Unknown error');
    });

    it('should handle Error with empty message', () => {
      const error = new Error('');
      const result = ErrorHandler.getErrorMessage(error);
      
      expect(result).toBe('');
    });

    it('should handle Error with special characters', () => {
      const error = new Error('Error with special chars: !@#$%^&*()');
      const result = ErrorHandler.getErrorMessage(error);
      
      expect(result).toBe('Error with special chars: !@#$%^&*()');
    });
  });

  describe('wrapError', () => {
    it('should wrap Error instance with context', () => {
      const originalError = new Error('Original error message');
      const context = 'Test context';
      
      const result = ErrorHandler.wrapError(originalError, context);
      
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Test context: Original error message');
    });

    it('should wrap non-Error instance with context', () => {
      const originalError = 'String error';
      const context = 'Validation context';
      
      const result = ErrorHandler.wrapError(originalError, context);
      
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Validation context: Unknown error');
    });

    it('should handle empty context', () => {
      const originalError = new Error('Test error');
      const context = '';
      
      const result = ErrorHandler.wrapError(originalError, context);
      
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe(': Test error');
    });

    it('should handle context with special characters', () => {
      const originalError = new Error('Database error');
      const context = 'User service (create)';
      
      const result = ErrorHandler.wrapError(originalError, context);
      
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('User service (create): Database error');
    });

    it('should create new Error instance', () => {
      const originalError = new Error('Original');
      const context = 'Context';
      
      const result = ErrorHandler.wrapError(originalError, context);
      
      expect(result).not.toBe(originalError);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('logError', () => {
    it('should log Error instance with context', () => {
      const error = new Error('Test error message');
      const context = 'Test context';
      
      ErrorHandler.logError(error, context);
      
      expect(consoleSpy).toHaveBeenCalledWith('[Test context] Error:', 'Test error message');
    });

    it('should log non-Error instance with context', () => {
      const error = 'String error';
      const context = 'Validation context';
      
      ErrorHandler.logError(error, context);
      
      expect(consoleSpy).toHaveBeenCalledWith('[Validation context] Error:', 'Unknown error');
    });

    it('should log stack trace for Error instances', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      const context = 'Test context';
      
      ErrorHandler.logError(error, context);
      
      expect(consoleSpy).toHaveBeenCalledWith('[Test context] Error:', 'Test error');
      expect(consoleSpy).toHaveBeenCalledWith('Stack trace:', 'Error: Test error\n    at test.js:1:1');
    });

    it('should not log stack trace for non-Error instances', () => {
      const error = 'String error';
      const context = 'Test context';
      
      ErrorHandler.logError(error, context);
      
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('[Test context] Error:', 'Unknown error');
    });

    it('should handle Error without stack trace', () => {
      const error = new Error('Test error');
      delete (error as any).stack;
      const context = 'Test context';
      
      ErrorHandler.logError(error, context);
      
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('[Test context] Error:', 'Test error');
    });

    it('should handle empty context in logging', () => {
      const error = new Error('Test error');
      const context = '';
      
      ErrorHandler.logError(error, context);
      
      expect(consoleSpy).toHaveBeenCalledWith('[] Error:', 'Test error');
    });
  });

  describe('integration tests', () => {
    it('should work together for complete error handling flow', () => {
      const originalError = new Error('Database connection failed');
      const context = 'User authentication';
      
      // Get error message
      const errorMessage = ErrorHandler.getErrorMessage(originalError);
      expect(errorMessage).toBe('Database connection failed');
      
      // Wrap error
      const wrappedError = ErrorHandler.wrapError(originalError, context);
      expect(wrappedError.message).toBe('User authentication: Database connection failed');
      
      // Log error
      ErrorHandler.logError(originalError, context);
      expect(consoleSpy).toHaveBeenCalledWith('[User authentication] Error:', 'Database connection failed');
    });

    it('should handle complex error scenarios', () => {
      const customError = { code: 'EACCES', message: 'Permission denied' };
      const context = 'File operation';
      
      // Get error message from non-Error
      const errorMessage = ErrorHandler.getErrorMessage(customError);
      expect(errorMessage).toBe('Unknown error');
      
      // Wrap non-Error
      const wrappedError = ErrorHandler.wrapError(customError, context);
      expect(wrappedError.message).toBe('File operation: Unknown error');
      
      // Log non-Error
      ErrorHandler.logError(customError, context);
      expect(consoleSpy).toHaveBeenCalledWith('[File operation] Error:', 'Unknown error');
    });
  });
});
