"use client";

import React from "react";
import { motion } from "framer-motion";

function ConstructionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        className="text-4xl font-bold mb-8 text-gray-800"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        中古屋頁面施工中
      </motion.div>
      <div className="relative">
        <motion.div
          className="w-20 h-20 bg-yellow-500 rounded-full mb-4"
          initial={{ y: 0 }}
          animate={{ y: [-10, 10] }}
          transition={{ yoyo: Infinity, duration: 0.6 }}
        />
        <motion.div
          className="w-40 h-2 bg-gray-300"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        <div className="flex justify-between mt-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-4 h-16 bg-gray-400"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            />
          ))}
        </div>
      </div>
      <motion.p
        className="mt-8 text-lg text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        我正在努力建設中，敬請期待！
      </motion.p>
    </div>
  );
}

export default ConstructionPage;
