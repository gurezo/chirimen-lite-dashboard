import { ParserUtils } from './parser-utils';

describe('ParserUtils', () => {
  describe('parseOutputLines', () => {
    it('should parse output with multiple lines', () => {
      const output = 'line1\nline2\nline3';
      const result = ParserUtils.parseOutputLines(output);

      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should remove empty lines', () => {
      const output = 'line1\n\nline2\n  \nline3';
      const result = ParserUtils.parseOutputLines(output);

      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should trim whitespace from lines', () => {
      const output = '  line1  \n\tline2\t\n  line3  ';
      const result = ParserUtils.parseOutputLines(output);

      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should handle single line', () => {
      const output = 'single line';
      const result = ParserUtils.parseOutputLines(output);

      expect(result).toEqual(['single line']);
    });

    it('should handle empty output', () => {
      const output = '';
      const result = ParserUtils.parseOutputLines(output);

      expect(result).toEqual([]);
    });
  });

  describe('parseLsOutput', () => {
    it('should parse ls -la output correctly', () => {
      const output = `total 123
drwxr-xr-x  2 pi pi 4096 Dec  1 10:00 .
drwxr-xr-x  3 pi pi 4096 Dec  1 09:59 ..
-rw-r--r--  1 pi pi  123 Dec  1 10:00 file.txt
drwxr-xr-x  2 pi pi 4096 Dec  1 10:01 directory
-rwxr-xr-x  1 pi pi 2048 Dec  1 10:02 script.sh`;

      const result = ParserUtils.parseLsOutput(output);

      expect(result).toHaveLength(5);
      // . と .. ディレクトリも含まれる
      expect(result[2]).toEqual({
        name: 'file.txt',
        size: 123,
        isDirectory: false,
      });
      expect(result[3]).toEqual({
        name: 'directory',
        size: 4096,
        isDirectory: true,
      });
      expect(result[4]).toEqual({
        name: 'script.sh',
        size: 2048,
        isDirectory: false,
      });
    });

    it('should skip total line and empty lines', () => {
      const output = `total 0

drwxr-xr-x  2 pi pi 4096 Dec  1 10:00 .
drwxr-xr-x  3 pi pi 4096 Dec  1 09:59 ..`;

      const result = ParserUtils.parseLsOutput(output);

      expect(result).toHaveLength(2); // . と .. ディレクトリが含まれる
    });

    it('should handle lines with insufficient parts', () => {
      const output = `total 123
drwxr-xr-x  2 pi pi 4096 Dec  1 10:00 .
drwxr-xr-x  3 pi pi 4096 Dec  1 09:59 ..
-rw-r--r--  1 pi pi  123 Dec  1 10:00
-rw-r--r--  1 pi pi  123 Dec  1 10:00 file.txt`;

      const result = ParserUtils.parseLsOutput(output);

      expect(result).toHaveLength(3); // . と .. ディレクトリも含まれる
      expect(result[2].name).toBe('file.txt');
    });

    it('should handle empty output', () => {
      const output = '';
      const result = ParserUtils.parseLsOutput(output);

      expect(result).toEqual([]);
    });

    it('should handle output with only total line', () => {
      const output = 'total 0';
      const result = ParserUtils.parseLsOutput(output);

      expect(result).toEqual([]);
    });
  });

  describe('parseIwlistOutput', () => {
    it('should parse iwlist scan output correctly', () => {
      const output = `wlan0     Scan completed :
          Cell 01 - Address: 00:11:22:33:44:55
                    ESSID:"MyWiFi"
                    Protocol:IEEE 802.11b
                    Mode:Master
                    Frequency:2.412 GHz (Channel 1)
                    Quality=70/70  Signal level=-40 dBm
                    Encryption key:on
                    Bit Rates:1 Mb/s; 2 Mb/s; 5.5 Mb/s; 11 Mb/s
                    IE: IEEE 802.11i/Vers. 1
                        Group Cipher : WEP40
                        Pairwise Ciphers : WEP40
                        Authentication Suites : PSK
          Cell 02 - Address: AA:BB:CC:DD:EE:FF
                    ESSID:"NeighborWiFi"
                    Protocol:IEEE 802.11g
                    Mode:Master
                    Frequency:2.437 GHz (Channel 6)
                    Quality=45/70  Signal level=-55 dBm
                    Encryption key:off
                    Bit Rates:6 Mb/s; 9 Mb/s; 12 Mb/s; 18 Mb/s; 24 Mb/s; 36 Mb/s; 48 Mb/s; 54 Mb/s`;

      const result = ParserUtils.parseIwlistOutput(output);

      expect(result).toHaveLength(2);

      expect(result[0]).toEqual({
        address: '00:11:22:33:44:55',
        essid: 'MyWiFi',
        spec: 'IEEE 802.11i/Vers. 1,WEP40,WEP40PSK',
        quality: 'Quality=70/70  Signal level=-40 dBm',
        frequency: '2.412 GHz (Channel 1)',
        channel: '1',
      });

      expect(result[1]).toEqual({
        address: 'AA:BB:CC:DD:EE:FF',
        essid: 'NeighborWiFi',
        spec: 'IEEE 802.11g',
        quality: 'Quality=45/70  Signal level=-55 dBm',
        frequency: '2.437 GHz (Channel 6)',
        channel: '6',
      });
    });

    it('should handle output with missing optional fields', () => {
      const output = `wlan0     Scan completed :
          Cell 01 - Address: 00:11:22:33:44:55
                    ESSID:"SimpleWiFi"
                    Protocol:IEEE 802.11n`;

      const result = ParserUtils.parseIwlistOutput(output);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        address: '00:11:22:33:44:55',
        essid: 'SimpleWiFi',
        spec: 'IEEE 802.11n',
      });
    });

    it('should handle empty output', () => {
      const output = '';
      const result = ParserUtils.parseIwlistOutput(output);

      expect(result).toEqual([{}]); // Empty output results in a single empty object
    });

    it('should handle output with no cells', () => {
      const output = 'wlan0     Scan completed :';
      const result = ParserUtils.parseIwlistOutput(output);

      expect(result).toEqual([{}]); // No cells results in a single empty object
    });
  });

  describe('parseIfconfigOutput', () => {
    it('should parse ifconfig output correctly', () => {
      const output = `lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 1234  bytes 123456 (120.5 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 1234  bytes 123456 (120.5 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::1234:5678:9abc:def0  prefixlen 64  scopeid 0x20<link>
        ether 00:11:22:33:44:55  txqueuelen 1000  (Ethernet)
        RX packets 5678  bytes 567890 (554.6 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 4567  bytes 456789 (446.0 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`;

      const result = ParserUtils.parseIfconfigOutput(output);

      expect(result.ipInfo).toContain('wlan0:');
      expect(result.ipInfo).toContain('inet 192.168.1.100');
      expect(result.ipInfo).toContain('MAC Address: 00:11:22:33:44:55');
      expect(result.ipaddr).toBe(
        '        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255'
      );
    });

    it('should handle output without wlan0 interface', () => {
      const output = `lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0`;

      const result = ParserUtils.parseIfconfigOutput(output);

      expect(result.ipInfo).toBe('wlan0: \n');
      expect(result.ipaddr).toBeUndefined();
    });

    it('should handle empty output', () => {
      const output = '';
      const result = ParserUtils.parseIfconfigOutput(output);

      expect(result.ipInfo).toBe('wlan0: \n');
      expect(result.ipaddr).toBeUndefined();
    });
  });

  describe('parseIwconfigOutput', () => {
    it('should parse iwconfig output correctly', () => {
      const output = `lo        no wireless extensions.

wlan0     IEEE 802.11  ESSID:"MyWiFi"  Nickname:"<WIFI@REALTEK>"
          Mode:Managed  Frequency=2.412 GHz  Access Point: 00:11:22:33:44:55
          Bit Rate=54 Mb/s   Tx-Power=20 dBm
          Retry min limit:7   RTS thr:off   Fragment thr:off
          Power Management:off
          Link Quality=70/70  Signal level=-40 dBm  Noise level=-95 dBm
          Rx invalid nwid:0  Rx invalid crypt:0  Rx invalid frag:0
          Tx excessive retries:0  Invalid misc:0   Missed beacon:0

eth0      no wireless extensions.`;

      const result = ParserUtils.parseIwconfigOutput(output);

      expect(result).toContain('wlan0     IEEE 802.11');
      expect(result).toContain('ESSID:"MyWiFi"');
      expect(result).toContain('Frequency=2.412 GHz');
      expect(result).toContain('Link Quality=70/70');
    });

    it('should handle output without wlan0 interface', () => {
      const output = `lo        no wireless extensions.
eth0      no wireless extensions.`;

      const result = ParserUtils.parseIwconfigOutput(output);

      expect(result).toBe('');
    });

    it('should handle empty output', () => {
      const output = '';
      const result = ParserUtils.parseIwconfigOutput(output);

      expect(result).toBe('');
    });
  });

  describe('integration tests', () => {
    it('should work together for complete network information parsing', () => {
      const lsOutput = `total 8
drwxr-xr-x  2 pi pi 4096 Dec  1 10:00 .
drwxr-xr-x  3 pi pi 4096 Dec  1 09:59 ..
-rw-r--r--  1 pi pi  123 Dec  1 10:00 network.log`;

      const iwlistOutput = `wlan0     Scan completed :
          Cell 01 - Address: 00:11:22:33:44:55
                    ESSID:"MyWiFi"
                    Protocol:IEEE 802.11n
                    Quality=70/70  Signal level=-40 dBm`;

      const ifconfigOutput = `wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        ether 00:11:22:33:44:55  txqueuelen 1000  (Ethernet)`;

      // Parse all outputs
      const files = ParserUtils.parseLsOutput(lsOutput);
      const wifiNetworks = ParserUtils.parseIwlistOutput(iwlistOutput);
      const networkInfo = ParserUtils.parseIfconfigOutput(ifconfigOutput);

      // Verify results
      expect(files).toHaveLength(3); // . と .. ディレクトリも含まれる
      expect(files[2].name).toBe('network.log');

      expect(wifiNetworks).toHaveLength(1);
      expect(wifiNetworks[0].essid).toBe('MyWiFi');

      expect(networkInfo.ipaddr).toContain('192.168.1.100');
    });
  });
});
