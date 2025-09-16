import React, { useState } from 'react';

function PublicRegisterPage({ onSuccess }) {
  const [form, setForm] = useState({ username: '', password: '', email: '', unique_id: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:8000/api/public-register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Account created! You can now log in.');
        setForm({ username: '', password: '', email: '', unique_id: '' });
        if (onSuccess) onSuccess();
      } else {
        // Show all error messages as a single string
        if (data.detail) {
          setError(data.detail);
        } else if (typeof data === 'object') {
          const messages = Object.values(data)
            .flat()
            .filter(Boolean)
            .join('\n');
          setError(messages || JSON.stringify(data));
        } else {
          setError(JSON.stringify(data));
        }
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}
        <div className="mb-4">
          <label className="block mb-1">Username</label>
          <input type="text" name="username" value={form.username} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1">ID</label>
          <input type="text" name="unique_id" value={form.unique_id} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="mb-6">
          <label className="block mb-1">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Register</button>
      </form>
    </div>
  );
}

export default PublicRegisterPage;
