"use client";

import { motion } from "framer-motion";
import { BentoGrid, BentoCard } from "@/components/ui/BentoCard";

const SKILL_CATEGORIES = [
  {
    category: "Frontend",
    skills: ["Next.js 15", "React", "TypeScript", "Framer Motion", "Tailwind CSS", "D3.js", "Three.js"],
    icon: "🎨",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    category: "Backend",
    skills: ["FastAPI", "Python 3.11", "PostgreSQL", "Redis", "SQLAlchemy", "Alembic", "Pydantic"],
    icon: "⚙️",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    category: "DevOps & Cloud",
    skills: ["Docker", "GitHub Actions", "AWS ECS", "AWS RDS", "CloudWatch", "Nginx", "CI/CD"],
    icon: "☁️",
    color: "from-orange-500/20 to-yellow-500/20",
  },
  {
    category: "Security",
    skills: ["OWASP Top 10", "JWT/OAuth2", "bcrypt", "Rate Limiting", "CORS", "CSP", "TLS 1.3"],
    icon: "🔒",
    color: "from-green-500/20 to-emerald-500/20",
  },
];

export function SkillsSection() {
  return (
    <section id="skills" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl gradient-text mb-4">
            Technical Stack
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Full-spectrum engineering capabilities across the entire product lifecycle
          </p>
        </motion.div>

        <BentoGrid className="grid-cols-1 sm:grid-cols-2">
          {SKILL_CATEGORIES.map((cat, i) => (
            <BentoCard key={cat.category} delay={i * 0.1} className={`bg-gradient-to-br ${cat.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="font-semibold text-foreground">{cat.category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill) => (
                  <motion.span
                    key={skill}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-full border border-border/50 bg-background/50 px-3 py-1 text-sm text-foreground backdrop-blur-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
