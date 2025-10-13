/**
 * @deprecated Use WiFiInfo from '@/shared/models/wifi.model' instead.
 * This interface will be removed in a future version.
 *
 * Migration:
 * - essid → ssid
 * - channel: string → number
 */
export interface WiFiInfo {
  address: string;
  essid: string;
  spec: string;
  quality: string;
  frequency: string;
  channel: string;
}
