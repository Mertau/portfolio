"use client";

import { motion } from "framer-motion";

export function AboutSection() {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl gradient-text mb-6">
              About Me
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                I'm a Computer Engineer who builds production-grade systems with a focus on
                scalability, security, and developer experience. I approach every project with
                an architect's mindset — designing for the system's future, not just its present.
              </p>
              <p className="leading-relaxed">
                My stack centers around <span className="text-foreground font-medium">Next.js 15</span> and{" "}
                <span className="text-foreground font-medium">FastAPI</span>, backed by{" "}
                <span className="text-foreground font-medium">PostgreSQL</span> and{" "}
                <span className="text-foreground font-medium">Redis</span> for data persistence and
                real-time features. I containerize everything with Docker and deploy to AWS.
              </p>
              <p className="leading-relaxed">
                Security is a first-class concern in everything I build — from OWASP Top 10
                compliance to JWT hardening and infrastructure security via VPCs and IAM policies.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Years Experience", value: "5+" },
                { label: "Projects Shipped", value: "20+" },
                { label: "Uptime Target", value: "99.9%" },
              ].map((stat) => (
                <div key={stat.label} className="bento-card py-4">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {[
              { label: "System Design", level: 92 },
              { label: "Frontend Engineering", level: 88 },
              { label: "Backend & APIs", level: 94 },
              { label: "DevOps & CI/CD", level: 78 },
              { label: "Security Engineering", level: 85 },
            ].map((skill, i) => (
              <div key={skill.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{skill.label}</span>
                  <span className="text-sm text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
