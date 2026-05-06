"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
  animate?: boolean;
  delay?: number;
}

export function BentoCard({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  animate = true,
  delay = 0,
}: BentoCardProps) {
  const colClasses = { 1: "col-span-1", 2: "col-span-2", 3: "col-span-3" };
  const rowClasses = { 1: "row-span-1", 2: "row-span-2" };

  const content = (
    <div
      className={cn(
        "bento-card h-full",
        colClasses[colSpan],
        rowClasses[rowSpan],
        className
      )}
    >
      {children}
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={cn(colClasses[colSpan], rowClasses[rowSpan])}
    >
      <div className={cn("bento-card h-full", className)}>{children}</div>
    </motion.div>
  );
}

export function BentoGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </div>
  );
}
