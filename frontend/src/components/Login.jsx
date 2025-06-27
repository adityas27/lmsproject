import React, { useState } from 'react';
import { login } from '../authService';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      setLoginErr('Incorrect username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white font-sans antialiased">
      {/* Background with a subtle gradient effect for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black -z-10"></div>

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-10 shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
            BrainBoard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200 text-lg" 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition duration-200 text-lg" 
            />
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-600 text-white font-semibold py-3 rounded-xl hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950 transition duration-300 ease-in-out transform hover:-translate-y-0.5 text-lg shadow-lg" 
          >
            Login
          </button>
        </form>

        {loginErr && (
          <p className="mt-6 text-center text-red-500 dark:text-red-400 text-sm font-medium">
            {loginErr}
          </p>
        )}

        <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-base">
          New to BrainBoard?{' '}
          <span
            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold cursor-pointer transition duration-200" 
            onClick={() => {
              navigate('/signup');
            }}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;