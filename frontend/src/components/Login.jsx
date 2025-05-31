import React, { useState } from 'react';
import { login } from '../authService';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setloginErr] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      setloginErr('Incorrect username or password')
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
  <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login</h2>
  <form onSubmit={handleSubmit} className="space-y-4">
    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
    >
      Login
    </button>
  </form>
  <p>{loginErr}</p>
  <p>Visiting us for the first time?, Please <span className="underline underline-offset-1 hover:cursor-pointer"onClick={() => {
        navigate('/signup')
      }}>Sign up</span> </p>
</div>

  );
}

export default Login;
