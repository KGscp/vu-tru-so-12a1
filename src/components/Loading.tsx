import React from 'react';
import { Rocket } from 'lucide-react';
import { motion } from 'motion/react';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#0a0f1a] flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Moving stars background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-0"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: -10,
            }}
            animate={{
              y: ['0vh', '100vh'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center w-full max-w-md px-8">
        {/* Landing Spaceship */}
        <div className="relative mb-16">
          {/* Landing Beam */}
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 200, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 bg-gradient-to-t from-cyan-500/20 via-cyan-400/10 to-transparent blur-xl origin-bottom"
          />

          {/* Rocket Icon */}
          <motion.div
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, type: "spring", stiffness: 50 }}
            className="relative z-10 text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]"
          >
            <Rocket size={80} strokeWidth={1.5} className="fill-cyan-950/80 rotate-180" />
            
            {/* Engine Thrust (Reverse for landing) */}
            <motion.div
              className="absolute -top-10 left-1/2 -translate-x-1/2 w-4 h-16 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent blur-md rounded-full origin-bottom"
              animate={{
                scaleY: [0.8, 1.2, 0.8],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 0.1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>

        {/* Loading Text */}
        <div className="relative z-10 flex flex-col items-center gap-4 w-full">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-[0.2em] uppercase text-center"
          >
            Đang Hạ Cánh...
          </motion.h2>
          
          {/* Neon Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white/5">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </div>
          
          <div className="flex justify-between w-full text-[9px] font-mono text-cyan-500/60 uppercase tracking-widest mt-1">
            <span>System Check</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
