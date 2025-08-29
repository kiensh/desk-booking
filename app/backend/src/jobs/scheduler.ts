import { CronJob } from 'cron';
import { config } from '../config';
import { logger } from '../lib/logger';
import { autoBookingJob, autoCheckInJob, autoCheckUserAuthJob } from './tasks';

class JobScheduler {
  private autoBookAndCheckInJob: CronJob | null = null;
  private autoCheckUserAuthJob: CronJob | null = null;

  start(): void {
    this.startAutoCheckUserAuthJob();
    this.startAutoBookAndCheckInJob();
  }

  private startAutoBookAndCheckInJob(): void {
    if (this.autoBookAndCheckInJob) return;

    this.autoBookAndCheckInJob = new CronJob(config.cron.autoBookAndCheckInJob, async () => {
      await autoBookingJob(); // Booking first
      await autoCheckInJob(); // CheckIn later
    });

    this.autoBookAndCheckInJob.start();
    logger.magenta(`Started Auto-Book-And-CheckIn job: \`${config.cron.autoBookAndCheckInJob}\` auto running at \`00:00 AM Mon-Fri\``);
  }

  private startAutoCheckUserAuthJob(): void {
    if (this.autoCheckUserAuthJob) return;

    this.autoCheckUserAuthJob = new CronJob(config.cron.autoCheckAuth, autoCheckUserAuthJob);
    this.autoCheckUserAuthJob.start();
    logger.magenta(`Started Auto-CheckUserAuth job: \`${config.cron.autoCheckAuth}\` auto running at \`every hours\``);
  }
}

export const jobScheduler = new JobScheduler();
