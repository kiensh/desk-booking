import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useApiRequest } from '../../contexts/useApiRequest.ts';

const fetchLogs = async (apiRequest: (url: string, options?: RequestInit) => Promise<Response>): Promise<string[]> => {
  const response = await apiRequest('/api/logs');
  const data = await response.json();
  return data.logs ?? [];
};

function LogsTab() {
  const apiRequest = useApiRequest();
  const [uniqueLogs, setUniqueLogs] = useState<Set<string>>(new Set());
  const [isAtBottom, setIsAtBottom] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const {
    data: logs = [],
    isLoading,
    refetch: originalRefetch,
  } = useQuery({
    queryKey: ['logs'],
    queryFn: () => fetchLogs(apiRequest),
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
  });

  useEffect(() => {
    const newLogs = logs.filter((log) => !uniqueLogs.has(log));
    if (newLogs.length > 0) {
      setUniqueLogs((prev) => new Set([...prev, ...newLogs]));
    }
  }, [logs, uniqueLogs]);

  useEffect(() => {
    if (logContainerRef.current && isAtBottom) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [uniqueLogs, isAtBottom]);

  const handleScroll = () => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 5);
    }
  };

  const scrollToTop = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
      setIsAtBottom(false);
    }
  };

  const scrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  };

  const refetch = () => {
    setUniqueLogs(new Set());
    originalRefetch().then((_) => _);
  };

  const extractTimestamp = (log: string): string => {
    const match = RegExp(/\[(.*?)]/).exec(log);
    return match ? match[1] : log.substring(0, 20);
  };

  const getLogColor = (log: string): string => {
    if (log.includes('\x1b[32m')) return '#28a745'; // green
    if (log.includes('\x1b[33m')) return '#ffc107'; // yellow
    if (log.includes('\x1b[31m')) return '#dc3545'; // red
    if (log.includes('\x1b[34m')) return '#007cba'; // blue
    if (log.includes('\x1b[36m')) return '#17a2b8'; // cyan
    if (log.includes('\x1b[35m')) return '#6f42c1'; // magenta
    if (log.includes('\x1b[92m')) return '#20c997'; // brightGreen
    if (log.includes('\x1b[94m')) return '#0dcaf0'; // brightBlue
    return '#666'; // gray default
  };

  const renderLogContent = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    if (logs.length === 0) {
      return <div>Click "Refresh Logs" to view application logs</div>;
    }
    return Array.from(uniqueLogs).map((log) => (
      <div
        key={extractTimestamp(log)}
        style={{
          margin: '2px 0',
          color: getLogColor(log),
        }}
      >
        {log.replace(/\[[0-9;]*m/g, '')}
      </div>
    ));
  };

  return (
    <div>
      <h3>Logs</h3>
      <div className="content-box">
        <button onClick={() => refetch()} style={{ marginBottom: '10px' }}>
          Refresh Logs
        </button>
        <div style={{ position: 'relative' }}>
          <div
            ref={logContainerRef}
            onScroll={handleScroll}
            style={{
              maxHeight: '400px',
              overflowY: 'scroll',
              fontFamily: 'monospace',
              fontSize: '12px',
              background: '#f8f9fa',
              padding: '10px',
              borderRadius: '4px',
            }}
          >
            {renderLogContent()}
          </div>
          <button
            onClick={isAtBottom ? scrollToTop : scrollToBottom}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              padding: '5px 10px',
              fontSize: '12px',
              backgroundColor: '#007cba',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {isAtBottom ? '↑ Top' : '↓ Bottom'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogsTab;
