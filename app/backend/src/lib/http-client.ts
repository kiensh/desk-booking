import https from 'https';
import { config } from '../config';
import { logger } from './logger';
import { ApiError } from './errors';
import { AuthHeaders, RequestOptions } from '../types';

export enum ApiPath {
  CheckUserAuth = '/aq-api/resources/476',
  BookDesk = '/aq-api/reservations/events',
  GetDesk = '/aq-api/reservations/views/floorplans/workspaces',
  GetReservation = '/aq-api/reservations/views',
  ChangeReservationState = '/aq-api/reservations/states',
  SearchUserByName = '/aq-api/users/views/search/by-name',
  SearchUserById = '/aq-api/users/search',
  SearchUser = '/aq-api/users/views',
}

class HttpClient {
  private makeRequestAttempt(options: RequestOptions, postData: string, serviceName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const duration = Date.now() - startTime;
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            if (!serviceName.includes('Silent')) {
              logger.error(
                `API Error: \`${serviceName}\` ${options.method} ${options.hostname}${options.path} - ${res.statusCode} (${duration}ms)`,
                { body: postData, error: data },
              );
            }
            if (res.statusCode === 401) {
              reject(new ApiError('Unauthorized', 401));
              return;
            }
            const message = JSON.parse(data).message;
            reject(new ApiError(message, res.statusCode || 500));
          }
        });
      });

      req.on('error', (error) => {
        const duration = Date.now() - startTime;
        if (!serviceName.includes('Silent')) {
          logger.error(
            `API Error: ${serviceName} ${options.method} ${options.hostname}${options.path} - Network Error (${duration}ms)`,
            { error: error.message },
          );
        }
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  async request(options: RequestOptions, postData: string, serviceName: string): Promise<string> {
    for (let attempt = 1; attempt <= config.api.maxRetries; attempt++) {
      try {
        return await this.makeRequestAttempt(options, postData, serviceName);
      } catch (error: any) {
        if (
          attempt < config.api.maxRetries &&
          error.code === 'ENOTFOUND' &&
          !(error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 404))
        ) {
          logger.warn(`Retry: Got an Error, start retrying ${attempt} times, ${error.message}`);
          await new Promise((resolve) => setTimeout(resolve, config.api.retryDelay * attempt));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }

  createOptions(path: ApiPath, userHeaders: AuthHeaders, method: string = 'POST'): RequestOptions {
    return {
      hostname: config.api.hostname,
      path,
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'AQOB-AppAuthToken': userHeaders['AQOB-AppAuthToken'],
        Authorization: userHeaders['Authorization'],
        'x-api-key': userHeaders['x-api-key'],
      },
    };
  }
}

export const httpClient = new HttpClient();
