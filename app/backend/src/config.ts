export const config = {
  port: process.env.PORT ?? 8080,
  dataPath: process.env.DATA_PATH ?? './',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  api: {
    hostname: 'apacbackend.tangoreserve.com',
    maxRetries: 3,
    retryDelay: 1000,
  },
  cron: {
    autoBookAndCheckInJob: '0 0 * * 1-5', // 00:00 AM Mon-Fri
    autoCheckAuth: '0 1-23 * * *', // Every hour
  },
};
