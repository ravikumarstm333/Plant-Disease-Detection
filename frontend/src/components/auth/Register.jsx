import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MapPin, Phone, Leaf, UserCheck, Eye, EyeOff, Github, Chrome, CheckCircle2, Circle } from 'lucide-react';
import { authAPI } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    location: '',
    phone: '',
    agreedToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Password Strength Calculator
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    let strength = 0;
    let requirements = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: /[!@#$%^&*]/.test(pwd),
    };

    Object.values(requirements).forEach(req => {
      if (req) strength++;
    });

    return { strength, requirements };
  }, [formData.password]);

  const getStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-500';
      case 5:
        return 'bg-green-600';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength.strength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
      case 3:
        return 'Fair';
      case 4:
        return 'Good';
      case 5:
        return 'Strong';
      default:
        return 'Very Weak';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the terms';
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
      const { confirmPassword, agreedToTerms, ...dataToSend } = formData;
      await authAPI.register(dataToSend);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} signup coming soon!`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
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
        className="w-full max-w-2xl z-10"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-8">
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
            Join DekhBhal
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-600 text-lg">
            Create your account to access AI disease detection and farmer marketplace
          </motion.p>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants}>
          <Card glass={true} className="backdrop-blur-xl bg-white/40 border border-white/60 shadow-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Input
                  icon={User}
                  label="Full Name"
                  type="text"
                  placeholder="Your full name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
              </motion.div>

              {/* Email */}
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

              {/* Role Selection */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:outline-none bg-white/70 backdrop-blur transition-all font-medium text-gray-700 hover:border-primary-400 cursor-pointer"
                  required
                >
                  <option value="farmer">🌾 Farmer</option>
                  <option value="market_manager">📊 Market Manager</option>
                  <option value="buyer">👤 Buyer</option>
                </select>
              </motion.div>

              {/* Location & Phone - Grid */}
              <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
                <Input
                  icon={MapPin}
                  label="Location"
                  type="text"
                  placeholder="e.g., Delhi, Mumbai"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={errors.location}
                  required
                />
                <Input
                  icon={Phone}
                  label="Phone Number"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                />
              </motion.div>

              {/* Password & Confirm Password - Grid */}
              <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
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

                <div className="relative">
                  <Input
                    icon={Lock}
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-12 text-gray-400 hover:text-primary-600 transition-all"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </motion.button>
                </div>
              </motion.div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <motion.div
                  variants={itemVariants}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Password Strength</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      passwordStrength.strength <= 2 ? 'bg-red-100 text-red-700' :
                      passwordStrength.strength <= 3 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>

                  {/* Strength Bar */}
                  <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden mb-3">
                    <motion.div
                      className={`h-full ${getStrengthColor()}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Requirements Checklist */}
                  <div className="space-y-2">
                    {[
                      { label: 'At least 8 characters', key: 'length' },
                      { label: 'Uppercase letter', key: 'uppercase' },
                      { label: 'Lowercase letter', key: 'lowercase' },
                      { label: 'Number', key: 'numbers' },
                      { label: 'Special character (!@#$%^&*)', key: 'special' },
                    ].map((req) => (
                      <motion.div
                        key={req.key}
                        className="flex items-center gap-2 text-xs"
                        animate={{ opacity: 1 }}
                      >
                        {passwordStrength.requirements[req.key] ? (
                          <CheckCircle2 size={16} className="text-green-600" />
                        ) : (
                          <Circle size={16} className="text-gray-400" />
                        )}
                        <span className={passwordStrength.requirements[req.key] ? 'text-green-700 font-medium' : 'text-gray-600'}>
                          {req.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Terms Checkbox */}
              <motion.div variants={itemVariants}>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <motion.input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded border-2 border-gray-300 bg-white cursor-pointer accent-primary-600 transition-all group-hover:border-primary-600"
                    whileHover={{ scale: 1.1 }}
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    I agree to the{' '}
                    <Link to="#" className="text-primary-600 font-semibold hover:text-primary-700 underline transition-colors">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="#" className="text-primary-600 font-semibold hover:text-primary-700 underline transition-colors">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreedToTerms && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {errors.agreedToTerms}
                  </motion.p>
                )}
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
                  {!loading && <UserCheck size={20} />}
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white/40 text-gray-600 font-medium backdrop-blur">
                    Or sign up with
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
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 font-bold hover:text-primary-700 transition-colors hover:underline"
              >
                Sign in here
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

export default Register;