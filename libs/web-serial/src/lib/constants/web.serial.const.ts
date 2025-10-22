export const WEB_SERIAL = {
  PORT: {
    SUCCESS: {
      OPEN: 'Web Serail Open Success',
      READABLE: 'Successed to config serial port.readable.',
      WRITABLE: 'Successed to config serial port.writable.',
    } as const,
    ERROR: {
      NOT_FOUND: 'Web Serial Open Error',
      NO_SELECTED:
        "Failed to execute 'requestPort' on 'Serial': No port selected by the user.",
      PORT_ALREADY_OPEN:
        "Failed to execute 'open' on 'SerialPort': The port is already open.",
      PORT_OPEN_FAIL:
        "Failed to execute 'open' on 'SerialPort': Failed to open serial port.",
      UNKNOWN: 'Unknown Error',
      PORT_WRITABLE_FAIL:
        "Failed to execute 'open' on 'SerialPort': Failed to open serial port.writable.",
    } as const,
  },
  RASPBERRY_PI: {
    IS_NOT_ZERO: 'Web Serial is not Raspbeyy Pi Zero',
  } as const,
  READ: {
    ERROR: {
      NOT_FOUND: 'Web Serial Open Error',
      NO_SELECTED:
        "Failed to execute 'requestPort' on 'Serial': No port selected by the user.",
      PORT_ALREADY_OPEN:
        "Failed to execute 'open' on 'SerialPort': The port is already open.",
      PORT_OPEN_FAIL:
        "Failed to execute 'open' on 'SerialPort': Failed to open serial port.",
      UNKNOWN: 'Unknown Error',
      PORT_WRITABLE_FAIL:
        "Failed to execute 'open' on 'SerialPort': Failed to open serial port.writable.",
    } as const,
  } as const,
} as const;

export const RASPBERRY_PI_ZERO_INFO = {
  usbVendorId: 0x0525,
  usbProductId: 0xa4a7,
} as const;
