import { RASPBERRY_PI_ZERO_INFO } from '../constants';

export async function isRaspberryPiZero(port: SerialPort): Promise<boolean> {
  const info = await port.getInfo();
  console.log('info:', info);
  return (
    info.usbVendorId === RASPBERRY_PI_ZERO_INFO.usbVendorId &&
    info.usbProductId === RASPBERRY_PI_ZERO_INFO.usbProductId
  );
}
