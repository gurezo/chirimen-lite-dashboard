export const WEB_SERIAL_MESSAGES = {
  OPEN_SUCCESS: 'Web Serail Open Success',
  IS_NOT_RASPBERRY_PI_ZERO: 'Web Serial is not Raspbeyy Pi Zero',
  NOT_FOUND_ERROR: 'Web Serial Open Error',
  ERROR_PORT_NO_SELECTED:
    "Failed to execute 'requestPort' on 'Serial': No port selected by the user.",
  ERROR_PORT_ALREADY_OPEN:
    "Failed to execute 'open' on 'SerialPort': The port is already open.",
  ERROR_PORT_OPEN_FAIL:
    "Failed to execute 'open' on 'SerialPort': Failed to open serial port.",
  ERROR_UNKNOWN: 'Unknown Error',
  ERROR_PORT_WRITABLE_FAIL:
    "Failed to execute 'open' on 'SerialPort': Failed to open serial port.writable.",
  PORT_WRITABLE_SUCCESS: 'Successed to config serial port.writable.',
  ERROR_PORT_READABLE_FAIL:
    "Failed to execute 'open' on 'SerialPort': Failed to open serial port.readable.",
  PORT_READABLE_SUCCESS: 'Successed to config serial port.readable.',
} as const;
