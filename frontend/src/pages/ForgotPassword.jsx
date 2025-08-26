import React, { useState } from "react";
import { motion } from "framer-motion";
import { apiConnector } from "../services/apiConnector";
import { endpoints } from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const { forgotPassword } = endpoints;

const fadeInUp = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate()

  const handleSendOTP = async () => {
    try {
      const res = await apiConnector("POST", forgotPassword, { phone });
      toast.success("OTP sent to your phone");
   
      navigate('/resetforgetpassword',{
  state: { phone: phone } // or any variable storing the number
})
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP");
    }
  };

 
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Blobs and Floating Elements reused from Login */}
      <motion.div
        className="bg-gray-900/70 backdrop-blur-md border border-yellow-300/20 rounded-2xl p-8 md:p-10 w-full max-w-md relative z-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-6 text-center" variants={fadeInUp}>
          Reset Password
        </motion.h2>

        
          <motion.div className="mb-6" variants={fadeInUp}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your registered phone"
              className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 placeholder-gray-400 focus:outline-none"
            />
            <button onClick={handleSendOTP} className="mt-4 w-full py-3 bg-yellow-500 text-black rounded-full font-semibold hover:bg-yellow-600 transition">
              Send OTP
            </button>
          </motion.div>

      </motion.div>

         {/* Tailwind CSS Custom Keyframes (from AboutUs page, ensured for consistency) */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-10px) translateX(5px) rotate(5deg); }
          50% { transform: translateY(0px) translateX(10px) rotate(0deg); }
          75% { transform: translateY(10px) translateX(5px) rotate(-5deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(15px); }
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

        @keyframes blob-medium {
          0%, 100% {
            border-radius: 40% 60% 70% 30% / 60% 40% 60% 40%;
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            border-radius: 70% 30% 50% 50% / 30% 60% 40% 70%;
            transform: translate(20px, -20px) scale(1.1);
          }
        }

        @keyframes blob-fast {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: translate(0px, 0px);
          }
          50% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: translate(15px, -15px);
          }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        .animate-blob-slow {
          animation: blob-slow 12s infinite alternate;
        }
        .animate-blob-medium {
          animation: blob-medium 8s infinite alternate;
        }
        .animate-blob-fast {
          animation: blob-fast 6s infinite alternate;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-fast {
          animation: spin-fast 10s linear infinite;
        }

        /* Custom loader styling for consistency */
        .loader1 {
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: black; /* Darker color for the spinning part */
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

    </div>
  );
}
