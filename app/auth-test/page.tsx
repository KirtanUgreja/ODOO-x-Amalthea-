'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export default function AuthTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<any>(null);

  const [loginForm, setLoginForm] = useState({
    email: 'admin@oneflow.com',
    password: 'Password123!',
  });

  const [registerForm, setRegisterForm] = useState({
    name: 'Test User',
    email: 'test@oneflow.com',
    password: 'Password123!',
    role: 'team_member',
    hourly_rate: '75',
  });

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setUser(data.user);
        setTokens(data.tokens);
        // Store tokens in localStorage for demo
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setUser(data.user);
        setTokens(data.tokens);
        // Store tokens in localStorage for demo
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetProfile = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No access token found. Please login first.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile fetched successfully');
        setUser(data.user);
      } else {
        setError(data.error || 'Failed to get profile');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setTokens(null);
    setMessage('Logged out successfully');
    setError('');
  };

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/test/database');
      const data = await response.json();

      if (response.ok) {
        setMessage(`Database Status: ${data.status} - ${data.message}`);
      } else {
        setError(`Database Error: ${data.error || 'Connection failed'}`);
      }
    } catch (err) {
      setError('Failed to test database connection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">OneFlow Authentication Test</h1>
        <p className="text-muted-foreground">Test the authentication system and database connection</p>
      </div>

      {message && (
        <Alert className="mb-4">
          <AlertDescription className="text-green-600">{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-4" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Test with existing user credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="loginEmail">Email</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="loginPassword">Password</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleLogin} disabled={isLoading} className="w-full">
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Register</CardTitle>
                  <CardDescription>Create a new user account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="registerName">Name</Label>
                    <Input
                      id="registerName"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="registerPassword">Password</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="registerRole">Role</Label>
                    <select 
                      id="registerRole"
                      className="w-full p-2 border rounded"
                      value={registerForm.role}
                      onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                    >
                      <option value="team_member">Team Member</option>
                      <option value="project_manager">Project Manager</option>
                      <option value="finance">Finance</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="registerRate">Hourly Rate</Label>
                    <Input
                      id="registerRate"
                      type="number"
                      value={registerForm.hourly_rate}
                      onChange={(e) => setRegisterForm({ ...registerForm, hourly_rate: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleRegister} disabled={isLoading} className="w-full">
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-2">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No user logged in</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleGetProfile} disabled={isLoading} className="w-full">
                Get Profile
              </Button>
              <Button onClick={testDatabaseConnection} disabled={isLoading} className="w-full" variant="outline">
                Test Database
              </Button>
              <Button onClick={handleLogout} className="w-full" variant="secondary">
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* Token Info */}
          {tokens && (
            <Card>
              <CardHeader>
                <CardTitle>Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Access Token:</strong> <span className="font-mono text-xs break-all">{tokens.accessToken.substring(0, 50)}...</span></p>
                  <p><strong>Expires In:</strong> {tokens.expiresIn}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Seeded Test Users</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p><strong>Admin:</strong> admin@oneflow.com</p>
              <p><strong>Password:</strong> Password123!</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p><strong>Manager:</strong> pm@oneflow.com</p>
              <p><strong>Password:</strong> Password123!</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p><strong>Developer:</strong> dev1@oneflow.com</p>
              <p><strong>Password:</strong> Password123!</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          All seeded users use the password: <strong>Password123!</strong>
        </p>
      </div>
    </div>
  );
}
