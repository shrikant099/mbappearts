import React, { useEffect, useState } from "react";
import { endpoints } from "../services/api";
import { apiConnector } from "../services/apiConnector";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setRole,
  setUserData,
  setToken,
} from "../slices/authSlice";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const { SIGN_UP, VERIFY_OTP } = endpoints;

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Signup() {
  const loading = useSelector((state) => state.auth.loading);
  const token = useSelector((state) => state.auth.token);
  const userData = useSelector((state) => state.auth.userData);
  const accountType = useSelector((state) => state.auth.role);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",  // Changed from phone to email
    password: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(setLoading(true));
      const response = await apiConnector("POST", SIGN_UP, formData);

      console.log("Signup response:", response);

      if (response.data.success) {
        toast.success("Registration successful! Please verify your email with OTP.");
        setUserEmail(formData.email);
        setShowOtpModal(true);
        
        // Don't set user data yet, wait for OTP verification
        setFormData({
          name: "",
          email: "",
          password: "",
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.log("Signup error:", err);
      toast.error(err.response?.data?.message || "Unable to register!");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      dispatch(setLoading(true));
      const response = await apiConnector("POST", VERIFY_OTP, {
        email: userEmail,
        otp: otp
      });

      console.log("OTP verification response:", response);

      if (response.data.success) {
        toast.success("Email verified successfully!");
        
        // Now set user data after successful verification
        dispatch(setUserData(response.data.user));
        dispatch(setToken(response.data.user.token || null));
        dispatch(setRole(response.data.user.accountType));

        setShowOtpModal(false);
        setOtp("");

        if (response.data.user.accountType === "user") {
          navigate("/");
        } else {
          navigate("/admindashboard");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.log("OTP verification error:", err);
      toast.error(err.response?.data?.message || "Invalid OTP!");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (token && userData) {
      if (accountType === "admin") {
        navigate("/admindashboard");
      } else {
        navigate("/");
      }
      toast.success(`Welcome! ${userData.name}`);
    }
  }, [token, accountType, userData, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD770]/5 rounded-full blur-3xl animate-blob-slow mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-700/5 rounded-full blur-3xl animate-blob-slow delay-1000 mix-blend-screen" />
        <div className="absolute top-[10%] left-[5%] w-4 h-4 bg-[#FFD770]/20 rounded-full animate-float opacity-70" />
        <div className="absolute bottom-[20%] right-[15%] w-6 h-6 bg-gray-500/20 rounded-full animate-float delay-500 opacity-70" />
        <div className="absolute top-[30%] right-[8%] w-5 h-5 bg-[#FFD770]/20 rounded-full animate-float delay-1000 opacity-70" />
      </div>

      {/* Main Signup Form */}
      {!showOtpModal && (
        <motion.form
          onSubmit={handleSubmit}
          className="bg-gray-900/70 backdrop-blur-md border border-[#FFD770]/30 rounded-2xl p-8 md:p-10 w-full max-w-md shadow-2xl relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FFD770] to-yellow-500 bg-clip-text text-transparent mb-8 text-center"
            variants={fadeInUp}
          >
            Create Your Account
          </motion.h2>

          <motion.label className="block mb-6" variants={fadeInUp}>
            <span className="text-gray-300 font-medium text-lg mb-2 block">
              Name
            </span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-300"
              required
            />
          </motion.label>

          <motion.label className="block mb-6" variants={fadeInUp}>
            <span className="text-gray-300 font-medium text-lg mb-2 block">
              Email Address
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-300"
              required
            />
          </motion.label>

          <motion.label className="block mb-8 relative" variants={fadeInUp}>
            <span className="text-gray-300 font-medium text-lg mb-2 block">
              Password
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-300 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-14 text-gray-400 hover:text-[#FFD770] transition-colors duration-200 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </motion.label>

          <motion.button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 ease-in-out active:scale-95 flex items-center justify-center gap-2"
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center w-full h-full">
                <div className="loader1 rounded-full w-6 h-6 animate-spin"></div>
              </div>
            ) : (
              <>Create Account</>
            )}
          </motion.button>

          <motion.div
            className="w-full text-center mt-6 text-gray-400 text-lg cursor-pointer hover:text-[#FFD770] transition-colors duration-300"
            onClick={() => navigate("/login")}
            variants={fadeInUp}
          >
            Already have an account?{" "}
            <span className="underline font-semibold">Login here</span>
          </motion.div>
        </motion.form>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <motion.form
          onSubmit={handleOtpSubmit}
          className="bg-gray-900/70 backdrop-blur-md border border-[#FFD770]/30 rounded-2xl p-8 md:p-10 w-full max-w-md shadow-2xl relative z-10"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FFD770] to-yellow-500 bg-clip-text text-transparent mb-8 text-center"
            variants={fadeInUp}
          >
            Verify Your Email
          </motion.h2>

          <motion.p
            className="text-gray-300 text-center mb-6"
            variants={fadeInUp}
          >
            We've sent a 6-digit OTP to <br />
            <span className="text-[#FFD770] font-semibold">{userEmail}</span>
          </motion.p>

          <motion.label className="block mb-8" variants={fadeInUp}>
            <span className="text-gray-300 font-medium text-lg mb-2 block">
              Enter OTP
            </span>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-300 text-center text-2xl tracking-widest"
              required
            />
          </motion.label>

          <motion.button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 ease-in-out active:scale-95 flex items-center justify-center gap-2"
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center w-full h-full">
                <div className="loader1 rounded-full w-6 h-6 animate-spin"></div>
              </div>
            ) : (
              <>Verify OTP</>
            )}
          </motion.button>

          <motion.div
            className="w-full text-center mt-6 text-gray-400 text-lg cursor-pointer hover:text-[#FFD770] transition-colors duration-300"
            onClick={() => {
              setShowOtpModal(false);
              setOtp("");
            }}
            variants={fadeInUp}
          >
            <span className="underline font-semibold">Back to Signup</span>
          </motion.div>
        </motion.form>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-10px) translateX(5px) rotate(5deg); }
          50% { transform: translateY(0px) translateX(10px) rotate(0deg); }
          75% { transform: translateY(10px) translateX(5px) rotate(-5deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
        }

        @keyframes blob-slow {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: translate(0px, 0px) scale(1);
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: translate(10px, -10px) scale(1.05);
          }
          50% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: translate(0px, 0px) scale(1);
          }
          75% {
            border-radius: 40% 70% 60% 30% / 70% 40% 60% 30%;
            transform: translate(-10px, 10px) scale(0.95);
          }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-blob-slow { animation: blob-slow 12s infinite alternate; }

        .loader-login {
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
