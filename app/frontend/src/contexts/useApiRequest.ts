import { useUserContext } from './UserContext.tsx';

export const useApiRequest = (): ((url: string, options?: RequestInit) => Promise<Response>) => {
  const { user, setUser } = useUserContext();

  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    options.headers = {
      'Content-Type': 'application/json',
      ['aqob-appauthtoken']: user?.appAuthToken ?? '',
      ['authorization']: user?.authorization ?? '',
      ['x-api-key']: user?.apiKey ?? '',
      ['user-id']: user?.userId?.toString() ?? '0',
      ...options.headers,
    };
    const response = await fetch(url, options);

    if (response.status === 401) {
      setUser(null);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update cron config');
    }

    return response;
  };
};
