import React, { useState } from 'react';
import { signup } from '../authService';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [errs, setErrs] = useState([])
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, username, password, password2);
      alert('Signup successful. Please login.');
      navigate('/login');
    } catch (error) {
      setErrs(error.response.data["password"])
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Signup failed. Server response:', error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response from server:', error.request);
      } else {
        // Other errors
        console.error('Error during signup:', error.message);
      }
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Signup</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Signup
          </button>
        </form>
        <p>If you already are user please <span className="underline underline-offset-1 hover:cursor-pointer" onClick={() => {navigate('/login')}}>login</span></p>
        <p>{errs}</p>
        
</div>
    </>
  );
}

export default Signup;
