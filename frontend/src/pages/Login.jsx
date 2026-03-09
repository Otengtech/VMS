// src/pages/Login.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-dismiss error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear any previous errors

    try {
      const result = await login(email, password);
      
      if (result?.success) {
        if (result.user.role === "superadmin") {
          navigate("/superadmin/dashboard");
        } else {
          navigate("/admin/dashboard");
        }
      } else {
        setError(result?.message || "Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50/30">
      {/* Left Side - Branding/Visual */}
      <div className="hidden md:flex md:w-1/2 min-h-screen bg-black p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-black rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-light">Login to access Dashboard</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-light text-white mb-4 leading-relaxed">
            Manage your platform
            <br />
            with ease and precision
          </h1>
          <p className="text-white/80 text-sm max-w-md">
            Access the admin dashboard to oversee users, monitor analytics, and configure system settings all in one place.
          </p>
          
          {/* Feature list */}
          <div className="mt-8 space-y-3">
            {["Real-time analytics", "User management", "System configuration"].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-white/90">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-xs">
          © 2024 AdminPortal. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl shadow-lg mb-4 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-light text-stone-800">Welcome Back</h2>
            <p className="text-stone-500 text-sm mt-2">Please enter your credentials to continue</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl flex items-center gap-3 animate-shake">
              <div className="w-1 h-8 bg-red-400 rounded-full"></div>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50/50 border border-stone-200 rounded-2xl 
                           text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-400 
                           focus:ring-2 focus:ring-amber-200 transition-all duration-300
                           hover:bg-white hover:border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wider ml-1">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border border-stone-200 rounded-2xl 
                           text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-400 
                           focus:ring-2 focus:ring-amber-200 transition-all duration-300
                           hover:bg-white hover:border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 
                           hover:text-amber-600 transition-colors duration-200 rounded-full
                           hover:bg-stone-100 disabled:opacity-50"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-6 group overflow-hidden disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-black rounded-2xl opacity-100 group-hover:opacity-90 transition-opacity disabled:opacity-50"></div>
              <div className="relative flex items-center justify-center gap-2 px-6 py-3.5 text-white font-medium">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>LOGIN</span>
                    <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}