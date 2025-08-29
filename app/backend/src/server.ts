import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { setupRoutes } from './routes';
import { userService } from './services/user.service';
import { jobScheduler } from './jobs/scheduler';

console.log('[LOAD_ENV]', {
  NODE_ENV: config.nodeEnv,
  DATA_PATH: config.dataPath,
  PORT: config.port,
});

const app = express();

app.use(cors());
app.use(express.json());

setupRoutes(app);

const startServer = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`Server running at http://localhost:${config.port}`);
      userService.loadUsersFromFile();
      jobScheduler.start();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer().then((_) => _);
