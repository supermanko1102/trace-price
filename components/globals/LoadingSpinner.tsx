import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <motion.div
        className="flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-4 h-4 bg-blue-500 rounded-full"
            animate={{
              y: ["0%", "-50%", "0%"],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: index * 0.15,
            }}
          />
        ))}
      </motion.div>
      <motion.p
        className="mt-4 text-lg font-semibold text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        載入中...
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;
