"use client";

import { motion } from "framer-motion";

interface BubbleProps {
  bubble: {
    id: string;
    x: number;
    y: number;
    size: number;
    color: string;
  };
  onPop: () => void;
}

const Bubble = ({ bubble, onPop }: BubbleProps) => {
  // Ensure x and y are valid numbers to prevent NaN in style properties
  const safeX = typeof bubble.x === 'number' && !isNaN(bubble.x) ? bubble.x : 0;
  const safeY = typeof bubble.y === 'number' && !isNaN(bubble.y) ? bubble.y : 0;
  
  return (
    <motion.div
      className="absolute rounded-full cursor-pointer flex items-center justify-center z-10"
      style={{
        left: safeX,
        top: safeY,
        width: bubble.size,
        height: bubble.size,
        background: `radial-gradient(circle at 30% 30%, white 0%, ${bubble.color} 60%)`,
        boxShadow: `0 0 10px ${bubble.color}, inset 0 0 10px rgba(255, 255, 255, 0.8)`,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      exit={{ scale: 0, opacity: 0 }}
      onClick={(e) => {
        e.preventDefault(); // Prevent default behavior
        e.stopPropagation(); // Prevent event from bubbling to parent
        onPop(); // Call the onPop function to remove the bubble
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <div className="absolute w-[20%] h-[20%] rounded-full bg-white/80 top-[25%] left-[25%]" />
    </motion.div>
  );
};

export default Bubble;