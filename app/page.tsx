"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <motion.h1
        className="text-4xl font-bold mb-8 text-gray-800"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        歡迎來到房地產資訊平台
      </motion.h1>
      <div className="flex space-x-4">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/presale-house">
            <Button
              variant="default"
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              查看預售屋
            </Button>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/used-house">
            <Button
              variant="default"
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              查看中古屋
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
