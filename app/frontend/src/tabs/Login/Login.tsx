import React, { ChangeEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AuthHeaders, User } from '../../types.ts';
import { useUserContext } from '../../contexts/UserContext.tsx';

const parseHeaders = (text: string): AuthHeaders => {
  const lines = text.split('\n');
  const parsed: AuthHeaders = {
    'AQOB-AppAuthToken': '',
    Authorization: '',
    'x-api-key': '',
  };

  lines.forEach((line) => {
    if (line.includes('AQOB-AppAuthToken:')) {
      parsed['AQOB-AppAuthToken'] = line.split('AQOB-AppAuthToken:')[1].trim();
    } else if (line.includes('Authorization:')) {
      parsed.Authorization = line.split('Authorization:')[1].trim();
    } else if (line.includes('x-api-key:')) {
      parsed['x-api-key'] = line.split('x-api-key:')[1].trim();
    }
  });

  return parsed;
};

const loginApi = async ({ headers, email }: { headers: AuthHeaders; email?: string }) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'aqob-appauthtoken': headers['AQOB-AppAuthToken'],
      authorization: headers.Authorization,
      'x-api-key': headers['x-api-key'],
    },
    body: JSON.stringify({ email }),
  });
  return response.json();
};

function Login() {
  const { setUser } = useUserContext();
  const [rawHeaders, setRawHeaders] = useState<string>('');
  const [headers, setHeaders] = useState<AuthHeaders>({
    'AQOB-AppAuthToken': '',
    Authorization: '',
    'x-api-key': '',
  });
  const [error, setError] = useState<string>('');
  const [showSearchUsers, setShowSearchUsers] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');

  const { isPending, mutate } = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      if (!data.valid) {
        setError('Invalid credentials');
        return;
      }
      if (!data.userId) {
        setError('User Not Found');
        setShowSearchUsers(true);
        return;
      }
      const user: User = {
        userId: data.userId,
        email: data.email,
        appAuthToken: headers['AQOB-AppAuthToken'],
        authorization: headers.Authorization,
        apiKey: headers['x-api-key'],
      };
      setUser(user);
    },
    onError: (_) => {
      setError('Login failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedHeaders = parseHeaders(rawHeaders);
    if (!parsedHeaders['AQOB-AppAuthToken'] || !parsedHeaders.Authorization || !parsedHeaders['x-api-key']) {
      setError('Missing required headers. Please paste complete HTTP headers.');
      return;
    }
    setHeaders(parsedHeaders);
    setError('');
    mutate({ headers: parsedHeaders, email });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const parsedHeaders = parseHeaders(pastedText);
    if (parsedHeaders['AQOB-AppAuthToken'] && parsedHeaders.Authorization && parsedHeaders['x-api-key']) {
      setHeaders(parsedHeaders);
      setError('');
      mutate({ headers: parsedHeaders, email });
    }
  };

  const handleEmailOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value.endsWith('@')) {
      mutate({ headers, email: value });
    }
  };

  return (
    <div className="container">
      <h1>Desk Booking Manager - Login</h1>
      <div className="content-box">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>
              <span>Paste HTTP Headers:</span>
              <textarea
                value={rawHeaders}
                onChange={(e) => setRawHeaders(e.target.value)}
                onPaste={handlePaste}
                autoFocus
                placeholder={`Paste your HTTP request headers here...
Must contains (AQOB-AppAuthToken, Authorization, x-api-key)

Example:
POST /aq-api/reservations/views HTTP/1.1
Host: apacbackend.tangoreserve.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X)
AQOB-AppAuthToken: 805E2...DBC8F  \t<------- Required
Authorization: A4FDF...2785B  \t\t<------- Required
Content-Type: application/json
x-api-key: sTN0...ovorH  \t\t<------- Required`}
                rows={12}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                  resize: 'none',
                }}
                disabled={showSearchUsers}
                required
              />
            </label>
          </div>
          {showSearchUsers && (
            <div style={{ marginBottom: '15px' }}>
              <label>
                <span>Email:</span>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailOnChange}
                  placeholder="Enter email address"
                  disabled={isPending}
                  style={{
                    width: '100%',
                    padding: '8px',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </label>
            </div>
          )}
          <button type="submit" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
          </button>
          {error && <div style={{ marginTop: '10px', color: '#dc3545' }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default Login;
