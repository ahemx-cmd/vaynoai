import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const words = ["build", "sell", "create", "grow", "launch", "chill"];

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
          {/* Hand-drawn underline with multiple strokes */}
          <svg
            className="absolute -bottom-2 left-0 w-full h-4"
            viewBox="0 0 100 12"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M2,6 Q25,5 50,6.5 T98,7"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            <motion.path
              d="M1,8 Q25,7 50,8.5 T99,9"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            />
            <motion.path
              d="M0,10 Q25,9 50,10.5 T100,11"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </svg>
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default AnimatedText;
