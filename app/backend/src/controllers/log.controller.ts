import { Request, Response } from 'express';

const logHistory: string[] = [];

const originalConsoleLog = console.log;
console.log = (...args: any[]) => {
  const logEntry = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
  logHistory.push(logEntry);
  if (logHistory.length > 2000) logHistory.shift();
  originalConsoleLog(...args);
};

export const getLogsHandler = (req: Request, res: Response): void => {
  res.json({ logs: logHistory });
};
