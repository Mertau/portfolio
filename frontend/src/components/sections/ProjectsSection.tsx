"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BentoGrid, BentoCard } from "@/components/ui/BentoCard";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

interface Project {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[] | null;
  github_url: string | null;
  live_url: string | null;
  featured: boolean;
}

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.projects.list().then((res) => {
      setProjects(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl gradient-text mb-4">
            Featured Projects
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Production-grade applications demonstrating architectural depth and engineering excellence
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bento-card h-48 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <BentoGrid>
            {projects.map((project, i) => (
              <BentoCard
                key={project.id}
                colSpan={project.featured && i === 0 ? 2 : 1}
                delay={i * 0.1}
                className="group"
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{project.title}</h3>
                      {project.featured && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Featured</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                  </div>
                  <div className="mt-4">
                    {project.tech_stack && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {project.tech_stack.slice(0, 4).map((tech) => (
                          <span key={tech} className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {project.github_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer">GitHub</a>
                        </Button>
                      )}
                      {project.live_url && (
                        <Button size="sm" asChild>
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer">Live</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </BentoCard>
            ))}
          </BentoGrid>
        )}
      </div>
    </section>
  );
}
