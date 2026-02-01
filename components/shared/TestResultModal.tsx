'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface TestResultModalProps {
  isOpen: boolean;
  score: number;
  passed: boolean;
  onAction: () => void;
}

export default function TestResultModal({ isOpen, score, passed, onAction }: TestResultModalProps) {
  const backdropVariants: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants: any = {
    hidden: { scale: 0.8, opacity: 0, y: 20 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: { scale: 0.8, opacity: 0, y: 20 },
  };

  const scoreCircleVariants: any = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: score / 100, 
      opacity: 1,
      transition: { duration: 1.5, ease: "easeOut", delay: 0.3 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          />
          
          <motion.div
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header / Background Decoration */}
            <div className={`absolute top-0 left-0 right-0 h-32 ${
              passed 
                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' 
                : 'bg-gradient-to-br from-red-500/20 to-orange-500/20'
            }`} />
            
            <div className="relative p-8 text-center">
              {/* Score Indicator */}
              <div className="mb-6 relative mx-auto w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-100 dark:text-gray-800"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className={passed ? 'text-emerald-500' : 'text-red-500'}
                    variants={scoreCircleVariants}
                    initial="hidden"
                    animate="visible"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-black ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {score}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Score</span>
                </div>
                
                {/* Result Icon Badge */}
                <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-lg ${
                  passed ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  {passed ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Text Content */}
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                {passed ? 'Congratulations!' : 'Test Failed'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {passed 
                  ? 'You demonstrated excellent aptitude and have successfully passed the assessment.'
                  : `You scored ${score}%. A minimum score of 70% is required to pass. Don't give up!`}
              </p>

              {/* Action Button */}
              <Button
                variant={passed ? 'primary' : 'outline'}
                onClick={onAction}
                className={`w-full h-12 rounded-xl font-bold text-lg shadow-lg cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  passed 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20'
                    : 'border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
              >
                {passed ? 'Continue to Profile' : 'Try Again'}
              </Button>
            </div>

            {/* Confetti or Decoration for Pass */}
            {passed && (
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[20%] w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDuration: '2s' }} />
                <div className="absolute top-[10%] right-[20%] w-2 h-2 bg-blue-400 rounded-square animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute bottom-[20%] left-[10%] w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
