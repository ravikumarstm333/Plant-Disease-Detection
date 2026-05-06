import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, Leaf } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const [mode, setMode] = useState("login"); 
  // login | forgot | otp | reset

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    newPassword: ''
  });

  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();
  const { login } = useAuth();

  // ================= COMMON =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      login(res.data.access_token, res.data.user);
      toast.success("Login successful");
      navigate("/");

    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEND OTP =================
  const sendOTP = async () => {
    if (!formData.email) {
      toast.error("Enter email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      toast.success("OTP sent");
      setMode("otp");

      // TIMER
      setTimer(60);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const verifyOTP = async () => {
    if (!otp) return toast.error("Enter OTP");

    setLoading(true);

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
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      toast.success("OTP verified");
      setMode("reset");

    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESET PASSWORD =================
  const resetPassword = async () => {
    if (!formData.newPassword) {
      return toast.error("Enter new password");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          otp,
          password: formData.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Password updated!");
      setMode("login");

    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-6">

        {/* ================= LOGIN ================= */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Login</h2>

            <Input name="email" placeholder="Email" onChange={handleChange} />
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
            />

            <Button type="submit" loading={loading} className="w-full">
              Login
            </Button>

            <p
              onClick={() => setMode("forgot")}
              className="text-blue-500 text-center cursor-pointer"
            >
              Forgot Password?
            </p>
          </form>
        )}

        {/* ================= FORGOT ================= */}
        {mode === "forgot" && (
          <div className="space-y-4">
            <h2 className="text-2xl text-center font-bold">Forgot Password</h2>

            <Input name="email" placeholder="Enter email" onChange={handleChange} />

            <Button onClick={sendOTP} loading={loading}>
              Send OTP
            </Button>

            <Button onClick={() => setMode("login")} variant="secondary">
              Back
            </Button>
          </div>
        )}

        {/* ================= OTP ================= */}
        {mode === "otp" && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold">Verify OTP</h2>

            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <Button onClick={verifyOTP} loading={loading}>
              Verify OTP
            </Button>

            {timer > 0 ? (
              <p>⏳ Resend in {timer}s</p>
            ) : (
              <p
                onClick={sendOTP}
                className="text-blue-500 cursor-pointer"
              >
                Resend OTP
              </p>
            )}
          </div>
        )}

        {/* ================= RESET ================= */}
        {mode === "reset" && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold">Set New Password</h2>

            <Input
              placeholder="New Password"
              type="password"
              name="newPassword"
              onChange={handleChange}
            />

            <Button onClick={resetPassword} loading={loading}>
              Update Password
            </Button>
          </div>
        )}

        {/* Link to Register Page */}
        <p className="text-center mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;