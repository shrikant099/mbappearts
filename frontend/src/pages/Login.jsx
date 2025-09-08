import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setRole,
  setToken,
  setUserData,
} from "../slices/authSlice";
import { apiConnector } from "../services/apiConnector";
import { cartEndpoints, endpoints } from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../slices/cartSlice";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const { LOGIN_API } = endpoints;
const { getCart } = cartEndpoints;

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

export default function Login() {
  const [credentials, setCredentials] = useState({
    email: "",  // Changed from phone to email
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const loading = useSelector((state) => state.auth.loading);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      dispatch(setLoading(true));
      const response = await apiConnector("POST", LOGIN_API, credentials);
      const user = response.data.user;
      console.log("Login response:", response);

      if (response.data.success) {
        toast.success("Logged in Successfully!");

        dispatch(setUserData(response.data.user));
        dispatch(setToken(response.data.user.token));
        dispatch(setRole(response.data.user.accountType));

        // Load cart for user accounts
        if (response.data.user.accountType === "user") {
          try {
            console.log("TOKEN FOR CART:", response.data.user.token);
            const cartResponse = await apiConnector(
              "GET",
              `${getCart}/${user._id}`,
              null,
              { Authorization: `Bearer ${response.data.user.token}` }
            );
            console.log("Cart response:", cartResponse);

            if (cartResponse.data.success && cartResponse.data.cart) {
              cartResponse.data.cart.forEach((entry) => {
                const completeProduct = {
                  ...entry.product,
                  quantity: entry.quantity,
                  size: entry.size || "Standard",
                  color: entry.color ? [entry.color] : [],
                  material: entry.material ? [entry.material] : [],
                  selectedColor: entry.color || "",
                  selectedMaterial: entry.material || "",
                  selectedSize: entry.size || "Standard",
                  selectedVariant: entry.selectedVariant || null
                };
                dispatch(addToCart(completeProduct));
              });
            }
          } catch (cartError) {
            console.log("Cart loading error:", cartError);
            // Don't show error to user, cart loading is optional
          }
        }

        setCredentials({
          email: "",
          password: "",
        });

        if (response.data.user.accountType === "user") {
          navigate("/");
        } else {
          navigate("/admindashboard");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.log("Login error:", err);
      toast.error(err.response?.data?.message || "Login failed!");
    } finally {
      dispatch(setLoading(false));
    }
  };

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

      <motion.form
        onSubmit={handleLogin}
        className="bg-gray-900/70 backdrop-blur-md border border-[#FFD770]/30 rounded-2xl p-8 md:p-10 w-full max-w-md shadow-2xl relative z-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FFD770] to-yellow-500 bg-clip-text text-transparent mb-8 text-center"
          variants={fadeInUp}
        >
          Welcome Back!
        </motion.h2>

        <motion.label className="block mb-6" variants={fadeInUp}>
          <span className="text-gray-300 font-medium text-lg mb-2 block">Email Address</span>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-300"
            required
          />
        </motion.label>

        <motion.label className="block relative" variants={fadeInUp}>
          <span className="text-gray-300 font-medium text-lg mb-2 block">Password</span>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter your password"
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

        <div onClick={() => navigate('/forgetpassword')} className="text-slate-500 cursor-pointer w-full flex justify-end mb-8 mt-2">
          Forget Password?
        </div>

        <motion.button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 ease-in-out active:scale-95 flex items-center justify-center gap-2"
          variants={fadeInUp}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
        >
          {loading ? (
            <div className="loader1 rounded-full w-6 h-6 animate-spin"></div>
          ) : (
            <>Log In</>
          )}
        </motion.button>

        <motion.div
          className="w-full text-center mt-6 text-gray-400 text-lg cursor-pointer hover:text-[#FFD770] transition-colors duration-300"
          onClick={() => navigate('/signup')}
          variants={fadeInUp}
        >
          Don't have an account? <span className="underline font-semibold">Register here</span>
        </motion.div>
      </motion.form>

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
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: black;
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
