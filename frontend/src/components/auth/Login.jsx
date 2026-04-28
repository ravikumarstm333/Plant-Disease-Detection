import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, Leaf, Github, Chrome } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      console.log('Login Response:', response.data); // Debugging
      const { access_token, user } = response.data;

      console.log('Token:', access_token, 'User:', user); // Debugging
      login(access_token, user);
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      toast.success('Login successful!');
      
      // Debug: Check if user is set before navigate
      setTimeout(() => {
        console.log('Navigating to dashboard...');
        navigate('/');
      }, 500);
    } catch (error) {
      console.error('Login Error:', error); // Debugging
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    if (provider === 'Google') {
      // Use Google Identity Services (GSI)
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response) => {
          if (response.access_token) {
            try {
              setLoading(true);
              const res = await authAPI.socialLogin({ provider: 'google', token: response.access_token });
              login(res.data.access_token, res.data.user);
              toast.success('Google login successful!');
              navigate('/');
            } catch (err) {
              toast.error('Google authentication failed');
            } finally {
              setLoading(false);
            }
          }
        },
      });
      client.requestAccessToken();
    } else if (provider === 'GitHub') {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/callback/github`;
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const decorativeVariants = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Gradient Background */}
      <motion.div
        className="fixed inset-0 -z-10"
        animate={{
          background: [
            'linear-gradient(135deg, #F1F8F5 0%, #E8F5E9 50%, #D4EDDA 100%)',
            'linear-gradient(135deg, #E8F5E9 0%, #D4EDDA 50%, #F1F8F5 100%)',
            'linear-gradient(135deg, #D4EDDA 0%, #F1F8F5 50%, #E8F5E9 100%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Decorative Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 w-40 h-40 bg-secondary-100 rounded-full opacity-20 blur-3xl"
        variants={decorativeVariants}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-20 right-10 w-64 h-64 bg-primary-100 rounded-full opacity-20 blur-3xl"
        variants={decorativeVariants}
        animate="animate"
        transition={{ delay: 1 }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md z-10"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div
            animate={{ scale: [0.8, 1.1, 1], rotateZ: [0, 5, 0] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-center mb-6"
          >
            <motion.div
              className="bg-gradient-primary p-4 rounded-2xl shadow-lg"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Leaf className="text-white" size={40} strokeWidth={1.5} />
            </motion.div>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-3">
            Welcome Back
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-600 text-lg">
            Sign in to your dekhbhal account
          </motion.p>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants}>
          <Card glass={true} className="backdrop-blur-xl bg-white/40 border border-white/60 shadow-2xl rounded-3xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Input
                  icon={Mail}
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants}>
                <div className="relative">
                  <Input
                    icon={Lock}
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-12 text-gray-400 hover:text-primary-600 transition-all"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </motion.button>
                </div>
              </motion.div>

              {/* Remember & Forgot */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between text-sm"
              >
                <label className="flex items-center gap-2 cursor-pointer group">
                  <motion.input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-gray-300 bg-white cursor-pointer accent-primary-600 transition-all group-hover:border-primary-600"
                    whileHover={{ scale: 1.1 }}
                  />
                  <span className="text-gray-600 group-hover:text-gray-800 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  to="#"
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-all hover:underline"
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full bg-gradient-primary hover:shadow-lg"
                >
                  {!loading && <LogIn size={20} />}
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white/40 text-gray-600 font-medium backdrop-blur">
                    Or continue with
                  </span>
                </div>
              </motion.div>

              {/* Social Buttons */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="py-3 px-4 rounded-xl border-2 border-gray-300 hover:border-primary-500 bg-white/50 hover:bg-primary-50 transition-all font-semibold text-gray-700 flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
                >
                  <motion.div
                    whileHover={{ rotate: 20 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Chrome size={20} className="text-blue-600 group-hover:text-primary-600" />
                  </motion.div>
                  <span className="hidden sm:inline">Google</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleSocialLogin('GitHub')}
                  className="py-3 px-4 rounded-xl border-2 border-gray-300 hover:border-primary-500 bg-white/50 hover:bg-primary-50 transition-all font-semibold text-gray-700 flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
                >
                  <motion.div
                    whileHover={{ rotate: 20 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Github size={20} className="text-gray-800 group-hover:text-primary-600" />
                  </motion.div>
                  <span className="hidden sm:inline">GitHub</span>
                </motion.button>
              </motion.div>
            </form>

            {/* Footer Text */}
            <motion.p
              variants={itemVariants}
              className="text-center text-gray-700 mt-8 pt-6 border-t border-gray-200"
            >
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 font-bold hover:text-primary-700 transition-colors hover:underline"
              >
                Sign up here
              </Link>
            </motion.p>
          </Card>
        </motion.div>

        {/* Additional Info */}
        <motion.p
          variants={itemVariants}
          className="text-center text-gray-600 text-sm mt-8"
        >
          Secured with industry-standard encryption
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;