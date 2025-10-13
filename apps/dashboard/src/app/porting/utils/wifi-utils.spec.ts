import { WiFiUtils } from './wifi-utils';

describe('WiFiUtils', () => {
  describe('generateWpaSupplicantConfig', () => {
    it('should generate wpa_supplicant config with SSID and password', () => {
      const ssid = 'MyWiFi';
      const password = 'MyPassword123';

      const result = WiFiUtils.generateWpaSupplicantConfig(ssid, password);

      expect(result).toContain(
        'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev'
      );
      expect(result).toContain('update_config=1');
      expect(result).toContain('country=JP');
      expect(result).toContain(`ssid="${ssid}"`);
      expect(result).toContain(`psk="${password}"`);
      expect(result).toContain('key_mgmt=WPA-PSK');
    });

    it('should handle SSID with special characters', () => {
      const ssid = 'WiFi Network (2.4GHz)';
      const password = 'Complex!@#Password';

      const result = WiFiUtils.generateWpaSupplicantConfig(ssid, password);

      expect(result).toContain(`ssid="${ssid}"`);
      expect(result).toContain(`psk="${password}"`);
    });

    it('should handle empty SSID and password', () => {
      const ssid = '';
      const password = '';

      const result = WiFiUtils.generateWpaSupplicantConfig(ssid, password);

      expect(result).toContain('ssid=""');
      expect(result).toContain('psk=""');
    });

    it('should include all required configuration sections', () => {
      const result = WiFiUtils.generateWpaSupplicantConfig(
        'TestWiFi',
        'TestPass'
      );

      expect(result).toContain('network={');
      expect(result).toContain('}');
      expect(result).toMatch(
        /ctrl_interface=DIR=\/var\/run\/wpa_supplicant GROUP=netdev/
      );
      expect(result).toMatch(/update_config=1/);
      expect(result).toMatch(/country=JP/);
    });
  });

  describe('generateLegacyWifiSetupScript', () => {
    it('should generate legacy WiFi setup script', () => {
      const ssid = 'LegacyWiFi';
      const password = 'LegacyPass';

      const result = WiFiUtils.generateLegacyWifiSetupScript(ssid, password);

      expect(result).toContain('#!/bin/sh');
      expect(result).toContain('set -eu');
      expect(result).toContain('SSID=$1');
      expect(result).toContain('PASSWORD=$2');
      expect(result).toContain(
        'DEBIAN_VERSION=$(cut -d . -f 1 /etc/debian_version)'
      );
    });

    it('should include Debian 11 and below logic', () => {
      const result = WiFiUtils.generateLegacyWifiSetupScript(
        'TestWiFi',
        'TestPass'
      );

      expect(result).toContain('if [ "$DEBIAN_VERSION" -le 11 ]; then');
      expect(result).toContain(
        'WPA_CONF_PATH=/etc/wpa_supplicant/wpa_supplicant.conf'
      );
      expect(result).toContain('sudo sh -c "cat > $WPA_CONF_PATH" <<EOL');
      expect(result).toContain('sudo wpa_cli -i wlan0 reconfigure');
    });

    it('should include Debian 12+ logic', () => {
      const result = WiFiUtils.generateLegacyWifiSetupScript(
        'TestWiFi',
        'TestPass'
      );

      expect(result).toContain('else');
      expect(result).toContain(
        'sudo nmcli dev wifi connect "$SSID" password "$PASSWORD"'
      );
      expect(result).toContain('fi');
    });

    it('should handle SSID and password with special characters', () => {
      const ssid = 'WiFi Network "Special"';
      const password = 'Pass with spaces & symbols!';

      const result = WiFiUtils.generateLegacyWifiSetupScript(ssid, password);

      expect(result).toContain('SSID=$1');
      expect(result).toContain('PASSWORD=$2');
    });

    it('should include proper script structure', () => {
      const result = WiFiUtils.generateLegacyWifiSetupScript(
        'TestWiFi',
        'TestPass'
      );

      expect(result).toMatch(/^#!\/bin\/sh/);
      expect(result).toContain('set -eu');
      expect(result).toContain('fi');
    });
  });

  describe('generateBackupCommand', () => {
    it('should generate backup command', () => {
      const result = WiFiUtils.generateBackupCommand();

      expect(result).toBe(
        'sudo cp /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.backup'
      );
    });

    it('should always return the same backup command', () => {
      const result1 = WiFiUtils.generateBackupCommand();
      const result2 = WiFiUtils.generateBackupCommand();

      expect(result1).toBe(result2);
    });
  });

  describe('generateSaveConfigCommand', () => {
    it('should generate save config command', () => {
      const result = WiFiUtils.generateSaveConfigCommand();

      expect(result).toBe(
        'sudo tee /etc/wpa_supplicant/wpa_supplicant.conf > /dev/null'
      );
    });

    it('should always return the same save config command', () => {
      const result1 = WiFiUtils.generateSaveConfigCommand();
      const result2 = WiFiUtils.generateSaveConfigCommand();

      expect(result1).toBe(result2);
    });
  });

  describe('generateRestartCommands', () => {
    it('should generate restart commands array', () => {
      const result = WiFiUtils.generateRestartCommands();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result).toContain('sudo systemctl restart wpa_supplicant');
      expect(result).toContain('sudo systemctl restart networking');
    });

    it('should always return the same restart commands', () => {
      const result1 = WiFiUtils.generateRestartCommands();
      const result2 = WiFiUtils.generateRestartCommands();

      expect(result1).toEqual(result2);
    });

    it('should return commands in correct order', () => {
      const result = WiFiUtils.generateRestartCommands();

      expect(result[0]).toBe('sudo systemctl restart wpa_supplicant');
      expect(result[1]).toBe('sudo systemctl restart networking');
    });
  });

  describe('integration tests', () => {
    it('should work together for complete WiFi setup workflow', () => {
      const ssid = 'IntegrationTestWiFi';
      const password = 'IntegrationTestPass';

      // Generate wpa_supplicant config
      const wpaConfig = WiFiUtils.generateWpaSupplicantConfig(ssid, password);
      expect(wpaConfig).toContain(`ssid="${ssid}"`);
      expect(wpaConfig).toContain(`psk="${password}"`);

      // Generate legacy setup script
      const legacyScript = WiFiUtils.generateLegacyWifiSetupScript(
        ssid,
        password
      );
      expect(legacyScript).toContain('#!/bin/sh');
      expect(legacyScript).toContain('SSID=$1');
      expect(legacyScript).toContain('PASSWORD=$2');

      // Generate backup command
      const backupCmd = WiFiUtils.generateBackupCommand();
      expect(backupCmd).toContain('sudo cp');
      expect(backupCmd).toContain('.backup');

      // Generate save config command
      const saveCmd = WiFiUtils.generateSaveConfigCommand();
      expect(saveCmd).toContain('sudo tee');
      expect(saveCmd).toContain('> /dev/null');

      // Generate restart commands
      const restartCmds = WiFiUtils.generateRestartCommands();
      expect(restartCmds).toHaveLength(2);
      expect(restartCmds[0]).toContain('wpa_supplicant');
      expect(restartCmds[1]).toContain('networking');
    });

    it('should handle edge cases for WiFi configuration', () => {
      // Test with very long SSID and password
      const longSsid = 'A'.repeat(100);
      const longPassword = 'B'.repeat(100);

      const wpaConfig = WiFiUtils.generateWpaSupplicantConfig(
        longSsid,
        longPassword
      );
      expect(wpaConfig).toContain(`ssid="${longSsid}"`);
      expect(wpaConfig).toContain(`psk="${longPassword}"`);

      // Test with special characters that might cause issues
      const specialSsid = 'WiFi\n\t\r"\'\\';
      const specialPassword = 'Pass\n\t\r"\'\\';

      const specialConfig = WiFiUtils.generateWpaSupplicantConfig(
        specialSsid,
        specialPassword
      );
      expect(specialConfig).toContain(`ssid="${specialSsid}"`);
      expect(specialConfig).toContain(`psk="${specialPassword}"`);
    });

    it('should maintain consistent output format', () => {
      const testCases = [
        { ssid: 'Simple', password: 'Simple' },
        { ssid: 'Complex WiFi (2.4GHz)', password: 'Complex!@#Pass' },
        { ssid: '', password: '' },
        { ssid: 'A'.repeat(50), password: 'B'.repeat(50) },
      ];

      testCases.forEach(({ ssid, password }) => {
        const wpaConfig = WiFiUtils.generateWpaSupplicantConfig(ssid, password);
        const legacyScript = WiFiUtils.generateLegacyWifiSetupScript(
          ssid,
          password
        );

        // Verify wpa_supplicant config structure
        expect(wpaConfig).toMatch(
          /^ctrl_interface=DIR=\/var\/run\/wpa_supplicant GROUP=netdev/
        );
        expect(wpaConfig).toMatch(/update_config=1/);
        expect(wpaConfig).toMatch(/country=JP/);
        expect(wpaConfig).toMatch(/network=\{/);
        expect(wpaConfig).toMatch(/ssid=".*"/);
        expect(wpaConfig).toMatch(/psk=".*"/);
        expect(wpaConfig).toMatch(/key_mgmt=WPA-PSK/);
        expect(wpaConfig).toMatch(/\}/);

        // Verify legacy script structure
        expect(legacyScript).toMatch(/^#!\/bin\/sh/);
        expect(legacyScript).toMatch(/set -eu/);
        expect(legacyScript).toMatch(/SSID=\$1/);
        expect(legacyScript).toMatch(/PASSWORD=\$2/);
        expect(legacyScript).toMatch(/DEBIAN_VERSION=/);
        expect(legacyScript).toMatch(
          /if \[ "\$DEBIAN_VERSION" -le 11 \]; then/
        );
        expect(legacyScript).toMatch(/else/);
        expect(legacyScript).toMatch(/fi/);
      });
    });
  });
});
