const distro = 'linux-armv6l';
const nodeVersion = 'v22.9.0';
const chirimenDirectory = 'chirimenSetup';
const cronSettingText = 'chirimenCronSetting.txt';
const cronSettingLog = 'chirimenCronSetting.log';
const wiFiSetup = `\
#!/bin/sh
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
fi
`;

export const UseCommand = {
  cd: 'cd ',
  wget: 'wget ',
  pwd: 'pwd ',
  sudo: 'sudo ',
  ls: 'ls -al --quoting-style=c',
  rm: 'rm ', // フルパス、オプションをどうするか？
  cp: 'cp ', // コピー元・先をどうするか？
  mv: 'mv ', // コピー元・先をどうするか？
  base64: 'base64 ', // パスをどうするか？
} as const;
export type UseCommand = (typeof UseCommand)[keyof typeof UseCommand];

export const UseCommandNode = {
  distro: `DISTRO=${distro}`,
  get: `wget https://unofficial-builds.nodejs.org/download/release/${nodeVersion}/node-${nodeVersion}-${distro}.tar.xz`,
  showVersion: 'node -v',
  setVersion: `VERSION=${nodeVersion}`,
  mkDir: 'sudo mkdir -p /usr/local/lib/nodejs',
  xJvf: `sudo tar -xJvf node-${nodeVersion}-${distro}.tar.xz -C /usr/local/lib/nodejs`,
  pathSet: `echo -n -e "# Nodejs\nVERSION${nodeVersion}=\nDISTRO=${distro}\n\nexport PATH=/usr/local/lib/nodejs/node-${nodeVersion}-${distro}/bin:$PATH\n" | tee -a ~/.profile'`,
  golobalInstall: 'sudo npm install -g forever',
} as const;
export type UseCommandNode =
  (typeof UseCommandNode)[keyof typeof UseCommandNode];

export const UseCommandNpm = {
  showVersion: 'npm -v',
  install: 'npm install',
} as const;
export type UseCommandNpm = (typeof UseCommandNpm)[keyof typeof UseCommandNpm];

export const UseCommandChirmen = {
  mkDir: `mkdir ${chirimenDirectory}`,
  cd: `cd ${chirimenDirectory}`,
  getPackage:
    'wget -O package.json https://tutorial.chirimen.org/pizero/package.json',
  getRelayServer:
    'wget -O RelayServer.js https://chirimen.org/remote-connection/js/beta/RelayServer.js',
} as const;
export type UseCommandChirmen =
  (typeof UseCommandChirmen)[keyof typeof UseCommandChirmen];

export const UseCommandCamera = {
  config: 'sudo raspi-config nonint do_camera 0',
  configLegacy: 'sudo raspi-config nonint do_legacy 0',
} as const;
export type UseCommandCamera =
  (typeof UseCommandCamera)[keyof typeof UseCommandCamera];

export const UseCommandI2C = {
  detect: 'i2cdetect -y 1',
} as const;
export type UseCommandI2C = (typeof UseCommandI2C)[keyof typeof UseCommandI2C];

export const UseCommandCron = {
  remove: `rm ${cronSettingText}`,
  touch: `touch ${cronSettingText}`,
  regist: `crontab ./${cronSettingText}`,
  which: 'which forever',
  list: 'forever list --plain',
  start: 'forever start -w ', // ファイル名必須
  echo: 'echo -e "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n@reboot /usr/local/bin/forever start ', // ファイル名、アプリ名必須
  redirection: ` >> /tmp/${cronSettingLog} 2>&1" > ${cronSettingText}`,
} as const;
export type UseCommandCron =
  (typeof UseCommandCron)[keyof typeof UseCommandCron];

export const UseCommandOS = {
  historyControl: 'HISTCONTROL=ignoreboth', // ignorespace と ignoredups の省略形
  timezone: 'sudo timedatectl set-timezone Asia/Tokyo',
} as const;
export type UseCommandOS = (typeof UseCommandOS)[keyof typeof UseCommandOS];

export const UseCommandWifi = {
  scan: 'sudo iwlist wlan0 scan',
  ifconfig: 'ifconfig',
  ping: 'ping',
  ssh: 'sudo touch /boot/ssh',
  setup: wiFiSetup,
  // chmod: ` chmod +x wifi_setup.sh && ./wifi_setup.sh "${ssid}" "${pass}"`, // ssid, pass をどうするか？
  reboot: 'sudo reboot',
} as const;
export type UseCommandWifi =
  (typeof UseCommandWifi)[keyof typeof UseCommandWifi];
