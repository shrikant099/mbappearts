import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquareText,
  Handshake,
} from "lucide-react";
import { apiConnector } from "../services/apiConnector";
import { endpoints } from "../services/api";
import toast from "react-hot-toast";

// Animation variants for a consistent fade-in-up effect
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formattedData = {
        email: import.meta.env.VITE_EMAIL,
        title: formData.subject || "No Title chosen",
        body:
          formData.name && formData.email && formData.message
            ? `name: ${formData.name}
                email: ${formData.email}
                message: ${formData.message}`
            : "No body given",
      };

      await apiConnector("POST", endpoints.contactUs, formattedData);
      setFormData({ name: "", email: "", subject: "", message: "" });
      toast.success("Email sent successfully!!");
    } catch (error) {
      toast.error("Unable to send email.");
    }
  };

  return (
    <div className="bg-black text-white font-sans overflow-x-hidden relative min-h-screen">
      {/* GLOBAL BACKGROUND DOTS/BLOBS - Subtle and overlay everything */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD770]/5 rounded-full blur-3xl animate-blob-slow mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-700/5 rounded-full blur-3xl animate-blob-slow delay-1000 mix-blend-screen" />
        <div className="absolute top-[10%] left-[5%] w-4 h-4 bg-[#FFD770]/20 rounded-full animate-float opacity-70" />
        <div className="absolute bottom-[20%] right-[15%] w-6 h-6 bg-gray-500/20 rounded-full animate-float delay-500 opacity-70" />
        <div className="absolute top-[30%] right-[8%] w-5 h-5 bg-[#FFD770]/20 rounded-full animate-float delay-1000 opacity-70" />
        <div className="absolute bottom-[5%] left-[25%] w-7 h-7 bg-gray-500/20 rounded-full animate-float delay-1500 opacity-70" />
        <div className="absolute top-[45%] left-[12%] w-4 h-4 bg-[#FFD770]/20 rounded-full animate-float opacity-70" />
        <div className="absolute bottom-[35%] right-[2%] w-5 h-5 bg-gray-500/20 rounded-full animate-float delay-700 opacity-70" />
        <div className="absolute top-[60%] right-[20%] w-6 h-6 bg-[#FFD770]/20 rounded-full animate-float delay-1200 opacity-70" />
      </div>

      {/* Header Section */}
      <motion.header
        className="bg-gradient-to-br from-black to-gray-900 text-center py-20 px-4 relative z-10"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#FFD770] to-yellow-500 bg-clip-text text-transparent">
          Get in Touch with Mbappe Arts
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 leading-relaxed">
          Have a question about our furniture collections or want to discuss a custom project? Reach out to Mbappe Arts — we're happy to help!
        </p>
      </motion.header>

      {/* Info Cards */}
      <section className="py-16 px-6 relative z-10 bg-gradient-to-b from-gray-900 to-black">
        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={staggerContainer}
        >
          {/* Location Card */}
          <motion.div
            variants={fadeInUp}
            className="group bg-gray-900/50 border border-[#FFD770]/20 rounded-xl shadow-xl p-8 text-center flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 hover:border-[#FFD770]/60 hover:shadow-yellow-400/20"
          >
            <MapPin className="w-12 h-12 text-[#FFD770] mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-[#FFD770]">
              Our Location
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              Mbappe Arts<br />
              Ground Floor, Plot No 75<br />
              Post Udsar Lodera Teh Sardarshahar<br />
              Vikash Nagar Village Bholusar<br />
              Bholoosar, Churu District<br />
              Rajasthan 331403
            </p>
            
          </motion.div>

          {/* Call Us Card */}
          <motion.div
            variants={fadeInUp}
            className="group bg-gray-900/50 border border-[#FFD770]/20 rounded-xl shadow-xl p-8 text-center flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 hover:border-[#FFD770]/60 hover:shadow-yellow-400/20"
          >
            <Phone className="w-12 h-12 text-[#FFD770] mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-[#FFD770]">
              Call or Email Us
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              Customer Care:{" "}
              <a
                href="tel:+919694520525"
                className="text-[#FFD770] hover:underline"
              >
                +91 96945 20525
              </a>
              <br />
              Email:{" "}
              <a
                href="mailto:mbapearts@gmail.com"
                className="text-[#FFD770] hover:underline"
              >
                mbapearts@gmail.com
              </a>
            </p>
          </motion.div>

          {/* Collaborations Card */}
          <motion.div
            variants={fadeInUp}
            className="group bg-gray-900/50 border border-[#FFD770]/20 rounded-xl shadow-xl p-8 text-center flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 hover:border-[#FFD770]/60 hover:shadow-yellow-400/20"
          >
            <Handshake className="w-12 h-12 text-[#FFD770] mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-[#FFD770]">
              Collaborations
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              For business/partnership queries, please email:
              <br />
              <a
                href="mailto:mbapearts@gmail.com"
                className="text-[#FFD770] hover:underline"
              >
                mbapearts@gmail.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-6 relative z-10 bg-black">
        <div className="absolute top-10 left-10 w-28 h-28 bg-[#FFD770]/10 rounded-full blur-2xl animate-spin-fast opacity-50" />
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-gray-500/10 rounded-full blur-xl animate-pulse delay-700 opacity-50" />

        <motion.div
          className="bg-gray-900/70 backdrop-blur-md shadow-2xl max-w-3xl mx-auto rounded-3xl p-8 md:p-10 border border-[#FFD770]/30"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="flex items-center justify-center mb-8">
            <MessageSquareText className="w-12 h-12 text-[#FFD770] mr-4" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FFD770] to-yellow-500 bg-clip-text text-transparent">
              Drop Us a Message
            </h2>
          </div>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-300"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-300"
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-300"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-40 resize-none text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-300"
              required
            />
            <motion.button
              type="submit"
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl hover:shadow-yellow-400/50 transition-all duration-300 ease-in-out active:scale-95 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send Message
              <Mail className="w-5 h-5" />
            </motion.button>
          </form>
        </motion.div>
      </section>

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
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-blob-slow { animation: blob-slow 12s infinite alternate; }
        .animate-blob-medium { animation: blob-medium 8s infinite alternate; }
        .animate-blob-fast { animation: blob-fast 6s infinite alternate; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-fast { animation: spin-fast 10s linear infinite; }
      `}</style>
    </div>
  );
};

export default ContactUs;
