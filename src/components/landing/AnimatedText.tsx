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
              d="M0,7 Q12,5 23,6.5 Q35,8 48,6 Q62,4.5 75,7 Q88,9 100,7"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            <motion.path
              d="M0,6 Q15,7 28,5.5 Q40,4 55,6.5 Q68,8.5 82,6 Q92,4.5 100,6"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            />
            <motion.path
              d="M0,7.5 Q18,9 32,7 Q45,5.5 58,8 Q72,10 85,7.5 Q95,5.5 100,7.5"
              stroke="hsl(var(--primary))"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.45 }}
              transition={{ duration: 0.5, delay: 0.22 }}
            />
          </svg>
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default AnimatedText;
