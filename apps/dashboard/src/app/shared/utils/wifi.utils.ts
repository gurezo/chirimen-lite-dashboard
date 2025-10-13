/**
 * WiFi 設定ユーティリティ
 *
 * porting/utils/wifi-utils.ts から移行
 */
export class WiFiUtils {
  /**
   * wpa_supplicant 設定ファイルの内容を生成
   *
   * @param ssid SSID
   * @param password パスワード
   * @returns wpa_supplicant.conf の内容
   */
  static generateWpaSupplicantConfig(ssid: string, password: string): string {
    return `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=JP

network={
    ssid="${ssid}"
    psk="${password}"
    key_mgmt=WPA-PSK
}`;
  }

  /**
   * レガシー WiFi 設定スクリプトを生成
   *
   * @param ssid SSID
   * @param password パスワード
   * @returns WiFi 設定スクリプト
   */
  static generateLegacyWifiSetupScript(ssid: string, password: string): string {
    return `#!/bin/sh
set -eu

SSID=$1
PASSWORD=$2
DEBIAN_VERSION=$(cut -d . -f 1 /etc/debian_version)

if [ "$DEBIAN_VERSION" -le 11 ]; then
  WPA_CONF_PATH=/etc/wpa_supplicant/wpa_supplicant.conf
  sudo sh -c "cat > $WPA_CONF_PATH" <<EOL
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=JP
network={
  ssid="$SSID"
  psk="$PASSWORD"
}
EOL
  sudo wpa_cli -i wlan0 reconfigure
else
  sudo nmcli dev wifi connect "$SSID" password "$PASSWORD"
fi`;
  }

  /**
   * WiFi 設定のバックアップコマンドを生成
   *
   * @returns バックアップコマンド文字列
   */
  static generateBackupCommand(): string {
    return 'sudo cp /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.backup';
  }

  /**
   * WiFi 設定の保存コマンドを生成
   *
   * @returns 保存コマンド文字列
   */
  static generateSaveConfigCommand(): string {
    return 'sudo tee /etc/wpa_supplicant/wpa_supplicant.conf > /dev/null';
  }

  /**
   * WiFi サービスの再起動コマンドを生成
   *
   * @returns 再起動コマンドの配列
   */
  static generateRestartCommands(): string[] {
    return [
      'sudo systemctl restart wpa_supplicant',
      'sudo systemctl restart networking',
    ];
  }

  /**
   * ネットワークインターフェース設定コマンドを生成
   *
   * @param interfaceName インターフェース名（デフォルト: 'wlan0'）
   * @param action アクション（'up' または 'down'）
   * @returns ifconfig コマンド文字列
   */
  static generateInterfaceCommand(
    interfaceName: string = 'wlan0',
    action: 'up' | 'down' = 'up'
  ): string {
    return `sudo ifconfig ${interfaceName} ${action}`;
  }
}
