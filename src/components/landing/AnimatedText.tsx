import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const words = ["build", "sell", "grow", "launch", "chill"];

const AnimatedText = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="inline-block gradient-text relative"
        >
          {words[currentIndex]}
          {/* Hand-drawn underline */}
          <svg
            className="absolute -bottom-2 left-0 w-full h-3"
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,5.2 Q12,5.5 23,5.1 Q35,4.8 48,5.3 Q62,5.6 75,5 Q88,4.7 100,5.2"
              stroke="hsl(var(--primary))"
              strokeWidth="3.2"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.75 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            <motion.path
              d="M0,5.3 Q15,5.6 28,5.2 Q40,4.9 55,5.4 Q68,5.7 82,5.1 Q92,4.8 100,5.3"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 0.5, delay: 0.22 }}
            />
            <motion.path
              d="M0,5.1 Q18,5.4 32,5 Q45,4.7 58,5.2 Q72,5.5 85,4.9 Q95,4.6 100,5.1"
              stroke="hsl(var(--primary))"
              strokeWidth="2.8"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.65 }}
              transition={{ duration: 0.5, delay: 0.21 }}
            />
          </svg>
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default AnimatedText;
