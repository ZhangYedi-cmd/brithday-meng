import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Glassmorphism Card
interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  highlight?: boolean;
  children?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  highlight, 
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-500",
        "bg-white/10 backdrop-blur-md shadow-lg",
        highlight ? "border-gold-300/50 shadow-gold-400/20" : "border-white/10 shadow-black/20",
        className
      )}
      {...props}
    >
      {children}
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-tr from-gold-400/10 to-transparent pointer-events-none" />
      )}
    </motion.div>
  );
};

// Primary/Secondary Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth, 
  className, 
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gold-400 text-night-950 shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:bg-gold-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.5)]",
    secondary: "bg-white/10 text-gold-100 border border-white/20 hover:bg-white/20",
    ghost: "bg-transparent text-white/60 hover:text-white hover:bg-white/5"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], fullWidth ? 'w-full' : '', className)}
      {...props}
    >
      {children}
    </button>
  );
};

// Animated Modal Wrapper
export const ModalWrapper: React.FC<{ children: React.ReactNode, onClose?: () => void }> = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm relative"
      >
        <GlassCard className="p-6 md:p-8">
            {onClose && (
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white p-2"
                >
                    ✕
                </button>
            )}
            {children}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export const ScreenWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full max-w-md mx-auto flex flex-col h-full", className)}
    >
      {children}
    </motion.div>
  )
}