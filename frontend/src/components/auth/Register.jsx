import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MapPin, Phone, Leaf, UserCheck, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);

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
  const [otpLoading, setOtpLoading] = useState(false);

  const navigate = useNavigate();

  // ⏳ TIMER
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // STEP 1 → SEND OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      toast.success("OTP sent to email");
      setStep(2);
      setTimer(60);

    } catch (err) {
      toast.error(err.message); // Ab backend se aaya specific error dikhega
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const resendOTP = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");

      toast.success("OTP resent");
      setTimer(60);

    } catch (err) {
      toast.error(err.message); // Ab backend se aaya specific error dikhega
    }
  };

  // VERIFY OTP
  const handleVerifyOTP = async () => {

    if (!otp) {
      toast.error("Enter OTP");
      return;
    }

    setOtpLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          otp
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const { confirmPassword, agreedToTerms, ...dataToSend } = formData;

      await authAPI.register(dataToSend);

      toast.success("Account created successfully!");
      navigate("/login");

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Registration failed";
      toast.error(errorMsg);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">

      <Card className="w-full max-w-2xl p-6">

        {step === 1 ? (

          <form onSubmit={handleSubmit} className="space-y-4">

            <h2 className="text-2xl font-bold text-center">Register</h2>

            <Input name="name" placeholder="Name" onChange={handleChange} />
            <Input name="email" placeholder="Email" onChange={handleChange} />

            {/* ROLE */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
              <option value="market_manager">Market Manager</option>
            </select>

            <Input name="location" placeholder="Location" onChange={handleChange} />
            <Input name="phone" placeholder="Phone" onChange={handleChange} />

            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
            />

            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              onChange={handleChange}
            />

            <Button type="submit" loading={loading} className="w-full">
              Send OTP
            </Button>

          </form>

        ) : (

          <div className="space-y-4 text-center">

            <h2 className="text-2xl font-bold">Verify OTP</h2>

            <p>OTP sent to {formData.email}</p>

            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            {/* TIMER */}
            <p className="text-gray-600">
              ⏳ {timer > 0 ? `Resend in ${timer}s` : "You can resend OTP"}
            </p>

            {/* RESEND BUTTON */}
            <Button
              onClick={resendOTP}
              disabled={timer > 0}
              variant="secondary"
            >
              Resend OTP
            </Button>

            <Button onClick={handleVerifyOTP} loading={otpLoading}>
              Verify & Register
            </Button>

            <Button onClick={() => setStep(1)} variant="secondary">
              Back
            </Button>

          </div>

        )}

        <p className="text-center mt-4">
          Already have account? <Link to="/login">Login</Link>
        </p>

      </Card>
    </div>
  );
};

export default Register;