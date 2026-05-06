"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const TECH_BADGES = ["Next.js 15", "FastAPI", "PostgreSQL", "Redis", "Docker", "AWS"];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-background to-purple-900/20" />
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-px rounded-full bg-blue-400/30"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8"
      >
        <motion.div variants={itemVariants} className="mb-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Available for hire
          </span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl font-bold tracking-tight sm:text-7xl">
          <span className="text-foreground">Crafting </span>
          <span className="gradient-text">Production-Grade</span>
          <span className="text-foreground"> Software</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-3xl mx-auto leading-relaxed">
          Full-stack engineer specializing in scalable distributed systems, real-time applications,
          and high-performance web architectures. Building software that scales.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-8 flex flex-wrap justify-center gap-3">
          {TECH_BADGES.map((tech) => (
            <span key={tech} className="rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              {tech}
            </span>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/#projects">View Projects</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/visualizer">Live Visualizer</Link>
          </Button>
          <Button size="lg" variant="ghost" asChild>
            <Link href="/#contact">Get In Touch</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
