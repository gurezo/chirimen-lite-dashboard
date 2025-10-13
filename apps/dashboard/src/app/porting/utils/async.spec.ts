import { sleep, retry, timeout } from './async';

describe('Async Utils', () => {
  describe('sleep', () => {
    it('should resolve after specified milliseconds', async () => {
      const start = Date.now();
      const delay = 100;
      
      await sleep(delay);
      
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(delay);
    });

    it('should resolve immediately for 0 milliseconds', async () => {
      const start = Date.now();
      
      await sleep(0);
      
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(10); // Should be very fast
    });
  });

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await retry(mockFn, 3, 100);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry and succeed after failures', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const result = await retry(mockFn, 3, 100);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after all retries exhausted', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(retry(mockFn, 2, 50)).rejects.toThrow('Persistent failure');
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use default retry count and delay', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Failure'))
        .mockResolvedValue('success');
      
      const result = await retry(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('timeout', () => {
    it('should resolve when promise resolves before timeout', async () => {
      const promise = Promise.resolve('success');
      
      const result = await timeout(promise, 1000);
      
      expect(result).toBe('success');
    });

    it('should reject when promise takes longer than timeout', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 200));
      
      await expect(timeout(promise, 100)).rejects.toThrow('Timeout');
    });

    it('should reject with custom error message', async () => {
      const promise = new Promise(resolve => setTimeout(() => resolve('success'), 200));
      const customError = new Error('Custom timeout error');
      
      await expect(timeout(promise, 100, customError)).rejects.toThrow('Custom timeout error');
    });

    it('should reject when promise rejects', async () => {
      const promise = Promise.reject(new Error('Promise error'));
      
      await expect(timeout(promise, 1000)).rejects.toThrow('Promise error');
    });

    it('should clear timeout when promise resolves', async () => {
      jest.useFakeTimers();
      
      const promise = Promise.resolve('success');
      const timeoutPromise = timeout(promise, 1000);
      
      // タイマーを進める前にPromiseを解決
      await promise;
      
      const result = await timeoutPromise;
      expect(result).toBe('success');
      
      jest.useRealTimers();
    });
  });
});
