import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MapPin, Phone, Leaf, UserCheck, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { toast } from "react-hot-toast";

const Register = () => {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");

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
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name required';
    if (!formData.email) newErrors.email = 'Email required';
    if (!formData.password) newErrors.password = 'Password required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords not match';
    return newErrors;
  };

  // STEP 1 → SEND OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validateForm();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setLoading(true);

    try {
      await fetch("http://localhost:7860/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: formData.email })
      });

      toast.success("OTP sent to email");
      setStep(2);

    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 → VERIFY OTP + REGISTER
  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error("Enter OTP");
      return;
    }

    setOtpLoading(true);

    try {
      const res = await fetch("http://localhost:7860/auth/verify-otp", {
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

      toast.success("Account created!");
      navigate("/login");

    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-xl p-6">

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-4">

            <h2 className="text-2xl font-bold text-center">Register</h2>

            <Input name="name" placeholder="Name" onChange={handleChange} />
            <Input name="email" placeholder="Email" onChange={handleChange} />

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

            <Input name="location" placeholder="Location" onChange={handleChange} />
            <Input name="phone" placeholder="Phone" onChange={handleChange} />

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