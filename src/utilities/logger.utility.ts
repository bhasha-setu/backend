// src/utilities/logger.utility.ts

export class Logger {
  private static formatTime(): string {
    return new Date().toISOString();
  }

  public static info(message: string, context?: any): void {
    console.log(`\x1b[36m[INFO]\x1b[0m [${this.formatTime()}] ${message}`, context !== undefined ? context : '');
  }

  public static warn(message: string, context?: any): void {
    console.warn(`\x1b[33m[WARN]\x1b[0m [${this.formatTime()}] ${message}`, context !== undefined ? context : '');
  }

  public static error(message: string, error?: any): void {
    console.error(`\x1b[31m[ERROR]\x1b[0m [${this.formatTime()}] ${message}`, error !== undefined ? error : '');
  }

  public static ws(event: string, details?: any): void {
    console.log(`\x1b[35m[WEBSOCKET]\x1b[0m [${this.formatTime()}] [${event}]`, details !== undefined ? details : '');
  }

  public static drill(drillType: string, message: string): void {
    console.log(`\x1b[32m[DRILL:${drillType}]\x1b[0m [${this.formatTime()}] ${message}`);
  }
}

