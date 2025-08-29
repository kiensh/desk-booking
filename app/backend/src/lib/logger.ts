const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

class Logger {
  private log(message: string, data: Record<string, any> = {}, color: string = colors.gray): void {
    console.log(
      `${color}[${new Date().toLocaleString()}] ${message}${colors.reset}`,
      Object.keys(data).length ? data : '',
    );
  }

  success(message: string, data: Record<string, any> = {}): void {
    this.log(message, data, colors.green);
  }

  warn(message: string, data: Record<string, any> = {}): void {
    this.log(`Warning: ${message}`, data, colors.yellow);
  }

  error(message: string, data: Record<string, any> = {}): void {
    this.log(`Error: ${message}`, data, colors.red);
  }

  info(message: string, data: Record<string, any> = {}): void {
    this.log(message, data, colors.blue);
  }

  debug(message: string, data: Record<string, any> = {}): void {
    this.log(message, data, colors.gray);
  }

  cyan(message: string, data: Record<string, any> = {}): void {
    this.log(message, data, colors.cyan);
  }

  magenta(message: string, data: Record<string, any> = {}): void {
    this.log(message, data, colors.magenta);
  }
}

export const logger = new Logger();
