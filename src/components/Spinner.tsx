import React from "react";
import { motion } from "framer-motion";

const Spinner: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Outer ring */}
        <motion.div
          className="w-16 h-16 border-4 border-t-[#111B47] border-gray-200 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
        />
        {/* Center pulse */}
        <motion.div
          className="absolute w-6 h-6 bg-[#111B47] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.9, 0.6, 0.9],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Loading text with animation */}
      <motion.div
        className="mt-6 text-[#111B47] text-lg font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.span
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        >
          Loading
        </motion.span>
        <motion.span
          animate={{
            opacity: [0, 1, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
            times: [0, 0.5, 1],
          }}
        >
          ...
        </motion.span>
      </motion.div>
    </div>
  );
};

export default Spinner;
