"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const MacalyBadge = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Link 
        href="https://macaly.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/20 backdrop-blur-sm"
      >
        <span className="text-xs">Made with</span>
        <span className="font-bold">Macaly</span>
        <span className="text-xs opacity-80">✨</span>
      </Link>
    </motion.div>
  );
};

export default MacalyBadge;