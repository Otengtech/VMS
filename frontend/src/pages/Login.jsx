import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { WaveLoader } from '../components/Common/Loader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
            <FiLogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Vehicle Terminal Management System
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400 z-20" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 bg-gray-800 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400 z-20" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 bg-gray-800 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <WaveLoader />
            ) : (
              <>
                <FiLogIn className="h-5 w-5 mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;