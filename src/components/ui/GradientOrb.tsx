"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientOrbProps {
  className?: string;
  color?: "blue" | "purple" | "mixed";
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "w-48 h-48",
  md: "w-72 h-72",
  lg: "w-[500px] h-[500px]",
  xl: "w-[800px] h-[800px]",
};

const colorMap = {
  blue: "bg-brand-600/20",
  purple: "bg-accent-500/20",
  mixed: "bg-gradient-to-br from-brand-600/20 to-accent-500/20",
};

export function GradientOrb({ className, color = "blue", size = "lg" }: GradientOrbProps) {
  return (
    <motion.div
      className={cn(
        "absolute rounded-full blur-3xl pointer-events-none",
        sizeMap[size],
        colorMap[color],
        className
      )}
      animate={{
        scale: [1, 1.08, 1],
        opacity: [0.4, 0.6, 0.4],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
