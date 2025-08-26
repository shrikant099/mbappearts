import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Store, Heart, Users, Sparkles, Handshake, Globe } from "lucide-react";
import heroimage from "../assets/images/abouthero.jpeg";
import happycustomer from "../assets/images/happycustomer.jpg";
import image1 from "../assets/images/image1about.webp";
import fashionableimage from "../assets/images/fashionableimage.jpeg";
import ourproducts from "../assets/images/ourproducts.jpg";
import ourstores from "../assets/images/ourstores.png";
import ourfashion from "../assets/images/ourfashion.webp";

// Animation variants for a consistent fade-in-up effect
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
      staggerChildren: 0.2,
    }
  }
};

const AboutUs = () => {
  const exploreItems = [
    { image: ourproducts, title: "Our Products" },
    { image: ourstores, title: "Our Stores" },
    { image: ourfashion, title: "Our Fashion" }
  ];

  const valueItems = [
    {
      icon: Heart,
      title: "Quality First",
      description: "Premium materials and expert craftsmanship in every piece, ensuring lasting style and comfort."
    },
    {
      icon: Handshake,
      title: "Ethical Sourcing",
      description: "We partner with ethical factories and use sustainable practices to protect both people and the planet."
    },
    {
      icon: Globe,
      title: "Radical Transparency",
      description: "We believe in being open and honest about our processes, from sourcing to production."
    }
  ];

  const statsItems = [
    { icon: Users, number: "50K+", label: "Happy Customers" },
    { icon: ShoppingBag, number: "10K+", label: "Products Sold" },
    { icon: Store, number: "25+", label: "Retail Stores" },
    { icon: Star, number: "4.9", label: "Average Rating" }
  ];

  return (
    <div className="bg-black text-white font-sans overflow-x-hidden relative">
      {/* GLOBAL BACKGROUND DOTS/BLOBS - These will be subtle and overlay everything */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Large, slow-moving blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD770]/5 rounded-full blur-3xl animate-blob-slow mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-700/5 rounded-full blur-3xl animate-blob-slow delay-1000 mix-blend-screen" />

        {/* Smaller, faster-moving dots/particles */}
        <div className="absolute top-[10%] left-[5%] w-4 h-4 bg-[#FFD770]/20 rounded-full animate-float opacity-70" />
        <div className="absolute bottom-[20%] right-[15%] w-6 h-6 bg-gray-500/20 rounded-full animate-float delay-500 opacity-70" />
        <div className="absolute top-[30%] right-[8%] w-5 h-5 bg-[#FFD770]/20 rounded-full animate-float delay-1000 opacity-70" />
        <div className="absolute bottom-[5%] left-[25%] w-7 h-7 bg-gray-500/20 rounded-full animate-float delay-1500 opacity-70" />
        <div className="absolute top-[45%] left-[12%] w-4 h-4 bg-[#FFD770]/20 rounded-full animate-float opacity-70" />
        <div className="absolute bottom-[35%] right-[2%] w-5 h-5 bg-gray-500/20 rounded-full animate-float delay-700 opacity-70" />
        <div className="absolute top-[60%] right-[20%] w-6 h-6 bg-[#FFD770]/20 rounded-full animate-float delay-1200 opacity-70" />
      </div>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center text-center">
        <div className="absolute inset-0">
          <img
            src={heroimage}
            className="w-full h-full object-cover opacity-50"
            alt="Hero background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative z-10 px-4 max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-[#FFD770] to-yellow-500 bg-clip-text text-transparent">
            We Believe in Making a Difference
          </h1>
          <p className="text-base md:text-xl lg:text-2xl font-light text-gray-300">
            Exceptional Quality. Ethical Factories. Radical Transparency.
          </p>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gradient-to-b from-black to-gray-900 relative">
        {/* Section specific dots/blobs */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-[#FFD770]/10 rounded-full blur-2xl animate-spin-slow opacity-50" />
        <div className="absolute bottom-5 left-5 w-16 h-16 bg-gray-500/10 rounded-full blur-xl animate-pulse opacity-50" />

        <motion.div
          className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={staggerContainer}
        >
          {statsItems.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="flex flex-col items-center p-6 rounded-2xl bg-gray-900/50 border border-[#FFD770]/20 hover:border-[#FFD770]/60 transition-all duration-500"
            >
              <stat.icon className="w-10 h-10 text-[#FFD770] mb-4" />
              <span className="text-3xl md:text-5xl font-bold text-[#FFD770]">{stat.number}</span>
              <span className="text-sm md:text-base text-gray-400 font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Mission Statement */}
      <div className="py-20 bg-gray-900 relative">
         {/* Section specific dots/blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl animate-blob-fast" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gray-700/5 rounded-full blur-2xl animate-pulse delay-500" />

        <motion.div
          className="max-w-4xl mx-auto px-4 text-center relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <Sparkles className="w-12 h-12 text-[#FFD770] mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-[#FFD770] to-yellow-500 bg-clip-text text-transparent">
            Our Mission
          </h2>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            UKF Outfits is a fashion-forward destination offering timeless style with a modern flair. We curate premium clothing that blends quality, elegance, and individuality, empowering you to express yourself with confidence.
          </p>
        </motion.div>
      </div>

      {/* Core Values Section */}
      <div className="py-20 bg-gradient-to-b from-gray-900 to-black relative">
        {/* Section specific dots/blobs */}
        <div className="absolute top-20 left-20 w-20 h-20 bg-[#FFD770]/10 rounded-full blur-xl animate-float-slow opacity-70" />
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gray-500/10 rounded-full blur-xl animate-float-slow delay-1000 opacity-70" />
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-[#FFD770]/15 rounded-full blur-md animate-spin-slow opacity-70" />

        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#FFD770] to-yellow-500 bg-clip-text text-transparent">
              Our Core Values
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={staggerContainer}
          >
            {valueItems.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group p-8 rounded-2xl bg-gray-900/50 border border-[#FFD770]/20 hover:border-[#FFD770]/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              >
                <value.icon className="w-12 h-12 text-[#FFD770] mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-bold mb-4 text-[#FFD770]">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Happy Customer Section */}
      <div className="py-20 bg-black relative">
        {/* Section specific dots/blobs */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-blob-medium opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gray-700/5 rounded-full blur-2xl animate-spin-slow delay-500 opacity-50" />

        <motion.div
          className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <img
              src={happycustomer}
              className="w-full h-auto rounded-3xl object-cover shadow-2xl transition-transform duration-500 hover:scale-105"
              alt="Happy customer wearing our clothing"
            />
          </motion.div>
          <motion.div variants={fadeInUp} className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-5 bg-gradient-to-r from-[#FFD770] to-yellow-500 bg-clip-text text-transparent">
              Our Ethical Approach
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed max-w-xl lg:max-w-none mx-auto lg:mx-0">
              At UKF Outfits, our ethical approach is woven into every thread of our brand. We prioritize sustainable sourcing, fair labor practices, and mindful production that respects both people and the planet. By embracing transparency and responsibility, we ensure that fashion is not only beautiful but also conscientious. Because style should never come at the cost of integrity.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Image 1 */}
      <motion.div
        className="py-20 bg-gray-900 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        {/* Section specific dots/blobs */}
        <div className="absolute top-1/4 right-5 w-24 h-24 bg-[#FFD770]/10 rounded-full blur-xl animate-float opacity-70" />
        <div className="absolute bottom-1/4 left-5 w-16 h-16 bg-gray-500/10 rounded-full blur-md animate-float delay-700 opacity-70" />

        <img
          src={image1}
          alt="Fashionable model"
          className="w-full h-auto object-cover"
        />
      </motion.div>

      {/* Fashionable Clothing Section */}
      <div className="py-20 bg-gray-900 relative">
        {/* Section specific dots/blobs */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-[#FFD770]/5 rounded-full blur-3xl animate-blob-slow mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gray-700/5 rounded-full blur-3xl animate-blob-slow delay-1000 mix-blend-screen" />

        <motion.div
          className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center lg:text-left order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-5 bg-gradient-to-r from-[#FFD770] to-yellow-500 bg-clip-text text-transparent">
              Fashionable Clothing
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed max-w-xl lg:max-w-none mx-auto lg:mx-0">
              Fashionable clothing at UKF Outfits is an embodiment of sophistication, individuality, and modern elegance. Every piece is thoughtfully curated to celebrate self-expression, blending timeless silhouettes with trend-savvy design. We believe fashion should be empowering, not just stylish, which is why UKF brings garments that complement your personality and elevate your lifestyle. It's not just fashion, it's your signature look, delivered.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="order-1 lg:order-2">
            <img
              src={fashionableimage}
              className="w-full h-auto rounded-3xl object-cover shadow-2xl transition-transform duration-500 hover:scale-105"
              alt="Fashionable clothing"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* More to Explore Section */}
      <div className="py-20 bg-black text-center relative">
        {/* Section specific dots/blobs */}
        <div className="absolute top-10 left-10 w-28 h-28 bg-[#FFD770]/10 rounded-full blur-2xl animate-spin-fast opacity-50" />
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-gray-500/10 rounded-full blur-xl animate-pulse delay-700 opacity-50" />

        <motion.div
          className="max-w-7xl mx-auto px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold mb-16 bg-gradient-to-r from-[#FFD770] to-yellow-500 bg-clip-text text-transparent"
          >
            More to Explore
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {exploreItems.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group cursor-pointer"
              >
                <div className="overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <img
                    src={item.image}
                    className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={item.title}
                  />
                </div>
                <div className="mt-6 text-xl font-semibold text-gray-200 transition-colors duration-300 group-hover:text-[#FFD770]">
                  {item.title}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Tailwind CSS Custom Keyframes for animations */}
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
      `}</style>
    </div>
  );
};

export default AboutUs;