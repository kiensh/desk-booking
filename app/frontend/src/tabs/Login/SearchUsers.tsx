import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AuthHeaders, SearchUser, User } from '../../types.ts';
import { useUserContext } from '../../contexts/UserContext.tsx';

const searchUsersApi = async (name: string, headers: AuthHeaders): Promise<SearchUser[]> => {
  const response = await fetch('/api/users/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'aqob-appauthtoken': headers['AQOB-AppAuthToken'],
      authorization: headers.Authorization,
      'x-api-key': headers['x-api-key'],
    },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  return data.users ?? [];
};

const loginWithUserIdApi = async (userId: string, headers: AuthHeaders) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'aqob-appauthtoken': headers['AQOB-AppAuthToken'],
      authorization: headers.Authorization,
      'x-api-key': headers['x-api-key'],
      'user-id': userId,
    },
  });
  const data = await response.json();
  if (data.valid) {
    return data;
  }
  throw new Error('Invalid credentials');
};

function SearchUsers({ headers }: Readonly<{ headers: AuthHeaders }>) {
  const { setUser } = useUserContext();
  const [searchName, setSearchName] = useState<string>('');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [status, setStatus] = useState<string>('Enter a name to search for users');

  const mutation = useMutation({
    mutationFn: (name: string) => searchUsersApi(name, headers),
    onMutate: () => {
      setStatus('Searching...');
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        setUsers(data);
        setStatus('');
      } else {
        setUsers([]);
        setStatus('No users found');
      }
    },
    onError: () => {
      setUsers([]);
      setStatus('Failed to search users');
    },
  });

  const loginMutation = useMutation({
    mutationFn: (userId: string) => loginWithUserIdApi(userId, headers),
    onSuccess: (data, userId) => {
      const user: User = {
        userId: parseInt(userId),
        email: data.email,
        appAuthToken: headers['AQOB-AppAuthToken'],
        authorization: headers.Authorization,
        apiKey: headers['x-api-key'],
      };
      setUser(user);
    },
    onError: (_, userId) => {
      setUsers((prev) => prev.filter((user) => user.userId !== userId));
    },
  });

  const searchUsers = (): void => {
    if (!searchName.trim()) {
      setStatus('Please enter a name to search');
      return;
    }
    mutation.mutate(searchName);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      searchUsers();
    }
  };

  return (
    <div>
      <h3>Search Users</h3>
      <div className="content-box">
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter name (1 or 2 words)"
            style={{ width: '70%', marginRight: '10px' }}
          />
          <button onClick={searchUsers}>Search</button>
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {status && <div>{status}</div>}
          {users.map((user) => (
            <div
              key={user.userId}
              style={{
                margin: '5px 0',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <strong>{user.userName}</strong>
              <br />
              <small>Email: {user.email}</small>
              <br />
              <small>ID: {user.userId}</small>
              <br />
              <button
                onClick={() => loginMutation.mutate(user.userId)}
                disabled={loginMutation.isPending}
                style={{ marginTop: '5px' }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchUsers;
