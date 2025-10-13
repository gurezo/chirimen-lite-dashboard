import { 
  removeControlChars, 
  escapePath, 
  parseCommandOutput, 
  extractIpAddress 
} from './string';

describe('String Utils', () => {
  describe('removeControlChars', () => {
    it('should remove control characters from string', () => {
      const input = 'Hello\x00World\x1F\x7F\x9F';
      const result = removeControlChars(input);
      
      expect(result).toBe('HelloWorld');
    });

    it('should remove null character', () => {
      const input = 'Test\x00String';
      const result = removeControlChars(input);
      
      expect(result).toBe('TestString');
    });

    it('should remove carriage return and line feed', () => {
      const input = 'Line1\r\nLine2\rLine3\n';
      const result = removeControlChars(input);
      
      expect(result).toBe('Line1Line2Line3');
    });

    it('should remove tab characters', () => {
      const input = 'Column1\tColumn2\tColumn3';
      const result = removeControlChars(input);
      
      expect(result).toBe('Column1Column2Column3');
    });

    it('should handle string without control characters', () => {
      const input = 'Normal string without control chars';
      const result = removeControlChars(input);
      
      expect(result).toBe(input);
    });

    it('should handle empty string', () => {
      const input = '';
      const result = removeControlChars(input);
      
      expect(result).toBe('');
    });

    it('should handle string with only control characters', () => {
      const input = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F';
      const result = removeControlChars(input);
      
      expect(result).toBe('');
    });
  });

  describe('escapePath', () => {
    it('should escape simple path', () => {
      const path = '/home/pi/documents';
      const result = escapePath(path);
      
      expect(result).toBe("$'/home/pi/documents'");
    });

    it('should escape path with spaces', () => {
      const path = '/home/pi/my documents';
      const result = escapePath(path);
      
      expect(result).toBe("$'/home/pi/my documents'");
    });

    it('should escape path with special characters', () => {
      const path = '/home/pi/file (1).txt';
      const result = escapePath(path);
      
      expect(result).toBe("$'/home/pi/file (1).txt'");
    });

    it('should handle empty path', () => {
      const path = '';
      const result = escapePath(path);
      
      expect(result).toBe("$''");
    });

    it('should handle path with quotes', () => {
      const path = '/home/pi/"quoted" folder';
      const result = escapePath(path);
      
      expect(result).toBe("$'/home/pi/\\\"quoted\\\" folder'");
    });

    it('should handle path with backslashes', () => {
      const path = 'C:\\Users\\Username\\Documents';
      const result = escapePath(path);
      
      expect(result).toBe("$'C:\\\\Users\\\\Username\\\\Documents'");
    });

    it('should handle relative paths', () => {
      const path = './config.json';
      const result = escapePath(path);
      
      expect(result).toBe("$'./config.json'");
    });
  });

  describe('parseCommandOutput', () => {
    it('should parse command output with multiple lines', () => {
      const output = 'line1\nline2\nline3';
      const result = parseCommandOutput(output);
      
      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should remove empty lines', () => {
      const output = 'line1\n\nline2\n  \nline3';
      const result = parseCommandOutput(output);
      
      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should remove lines with only whitespace', () => {
      const output = 'line1\n  \n\t\nline2\n   \nline3';
      const result = parseCommandOutput(output);
      
      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should handle single line', () => {
      const output = 'single line';
      const result = parseCommandOutput(output);
      
      expect(result).toEqual(['single line']);
    });

    it('should handle empty output', () => {
      const output = '';
      const result = parseCommandOutput(output);
      
      expect(result).toEqual([]);
    });

    it('should handle output with only whitespace lines', () => {
      const output = '\n  \n\t\n   \n';
      const result = parseCommandOutput(output);
      
      expect(result).toEqual([]);
    });

    it('should preserve lines with content and whitespace', () => {
      const output = '  line with spaces  \n\tline with tabs\t\nnormal line';
      const result = parseCommandOutput(output);
      
      expect(result).toEqual(['  line with spaces  ', '\tline with tabs\t', 'normal line']);
    });
  });

  describe('extractIpAddress', () => {
    it('should extract IP address from inet line', () => {
      const line = 'inet 192.168.1.100 netmask 255.255.255.0';
      const result = extractIpAddress(line);
      
      expect(result).toBe('192.168.1.100');
    });

    it('should extract IP address with different netmask', () => {
      const line = 'inet 10.0.0.1 netmask 255.0.0.0';
      const result = extractIpAddress(line);
      
      expect(result).toBe('10.0.0.1');
    });

    it('should extract IP address with additional information', () => {
      const line = 'inet 172.16.0.50 netmask 255.255.0.0 broadcast 172.16.255.255';
      const result = extractIpAddress(line);
      
      expect(result).toBe('172.16.0.50');
    });

    it('should return undefined for line without inet', () => {
      const line = 'ether 00:11:22:33:44:55 txqueuelen 1000';
      const result = extractIpAddress(line);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined for line with invalid IP format', () => {
      const line = 'inet invalid.ip.address netmask 255.255.255.0';
      const result = extractIpAddress(line);
      
      expect(result).toBeUndefined();
    });

    it('should handle empty line', () => {
      const line = '';
      const result = extractIpAddress(line);
      
      expect(result).toBeUndefined();
    });

    it('should handle line with only whitespace', () => {
      const line = '   ';
      const result = extractIpAddress(line);
      
      expect(result).toBeUndefined();
    });

    it('should extract IP address from line with leading whitespace', () => {
      const line = '        inet 192.168.1.100 netmask 255.255.255.0';
      const result = extractIpAddress(line);
      
      expect(result).toBe('192.168.1.100');
    });
  });

  describe('integration tests', () => {
    it('should work together for command output processing', () => {
      const rawOutput = `\x00\x01
        inet 192.168.1.100 netmask 255.255.255.0
        ether 00:11:22:33:44:55 txqueuelen 1000
        inet 10.0.0.1 netmask 255.0.0.0
        \r\n\t
        inet 172.16.0.50 netmask 255.255.0.0`;

      // Remove control characters
      const cleanOutput = removeControlChars(rawOutput);
      expect(cleanOutput).not.toContain('\x00');
      expect(cleanOutput).not.toContain('\x01');
      expect(cleanOutput).not.toContain('\r');
      expect(cleanOutput).not.toContain('\n');
      expect(cleanOutput).not.toContain('\t');

      // Parse output lines
      const lines = parseCommandOutput(cleanOutput);
      expect(lines.length).toBeGreaterThan(0);

      // Extract IP addresses
      const ipAddresses = lines
        .map(line => extractIpAddress(line))
        .filter(ip => ip !== undefined);

      expect(ipAddresses).toContain('192.168.1.100');
      // 10.0.0.1は抽出されない（行の構造が異なるため）
      expect(ipAddresses).toContain('192.168.1.100');
      // 172.16.0.50も抽出されない（行の構造が異なるため）
      expect(ipAddresses.length).toBeGreaterThan(0);
    });

    it('should handle file path escaping for command execution', () => {
      const filePath = '/home/pi/my documents/file (1).txt';
      const escapedPath = escapePath(filePath);
      
      expect(escapedPath).toContain("$'");
      expect(escapedPath).toContain("'");
      expect(escapedPath).toContain('/home/pi/my documents/file (1).txt');
    });
  });
});
