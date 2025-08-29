import { CronConfig, Desk } from '../../types.ts';

export const fetchCronConfigsApi = async (
  apiRequest: (url: string, options?: RequestInit) => Promise<Response>,
): Promise<CronConfig[]> => {
  const response = await apiRequest('/api/cron-configs');
  const data = await response.json();
  return data.cronConfigs ?? [];
};

export const fetchDesksApi = async (
  apiRequest: (url: string, options?: RequestInit) => Promise<Response>,
): Promise<Desk[]> => {
  const response = await apiRequest('/api/desks', {
    method: 'POST',
    body: JSON.stringify({ date: new Date().toISOString() }),
  });
  const data = await response.json();
  return data.desks ?? [];
};

export const updateCronConfigApi = async (
  config: CronConfig,
  apiRequest: (url: string, options?: RequestInit) => Promise<Response>,
) => {
  const response = await apiRequest('/api/cron-configs', {
    method: 'POST',
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update cron config');
  }

  return response.json();
};

export const DayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
export const DayNumbers = [1, 2, 3, 4, 5] as const;
