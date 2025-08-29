import { Express } from 'express';
import { extractAuthHeadersMiddleware, handleAuthResponseMiddleware } from './middlewares/auth.middleware';
import { loggingMiddleware } from './middlewares/logging.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { asyncRoute } from './lib/async-route';
import { getDeskHandler, bookDeskHandler, bookAllDaysAdvancedHandler } from './controllers/desk.controller';
import { getReservationsHandler, reservationActionHandler } from './controllers/reservation.controller';
import { searchUsersHandler } from './controllers/user.controller';
import { getLogsHandler } from './controllers/log.controller';
import { loginHandler, logoutHandler } from './controllers/auth.controller';
import { getCronConfigsHandler, addOrUpdateCronConfigHandler } from './controllers/cron.controller';

export const setupRoutes = (app: Express): void => {
  app.use(loggingMiddleware);
  app.use(extractAuthHeadersMiddleware);
  app.use(handleAuthResponseMiddleware);

  app.get('/logs', getLogsHandler);

  app.post('/auth/login', asyncRoute(loginHandler));
  app.post('/auth/logout', asyncRoute(logoutHandler));

  app.post('/desks', asyncRoute(getDeskHandler));
  app.post('/desks/book', asyncRoute(bookDeskHandler));
  app.post('/desks/book-all-days', asyncRoute(bookAllDaysAdvancedHandler));

  app.post('/reservations', asyncRoute(getReservationsHandler));
  app.post('/reservations/action', asyncRoute(reservationActionHandler));

  app.post('/users/search', asyncRoute(searchUsersHandler));

  app.get('/cron-configs', asyncRoute(getCronConfigsHandler));
  app.post('/cron-configs', asyncRoute(addOrUpdateCronConfigHandler));

  app.use(errorMiddleware);
};
