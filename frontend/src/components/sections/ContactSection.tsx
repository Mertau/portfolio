"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormData) => {
    setServerError("");
    try {
      await api.contact.submit(data);
      setSubmitted(true);
      reset();
    } catch {
      setServerError("Failed to send message. Please try again.");
    }
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl gradient-text mb-4">
            Get In Touch
          </h2>
          <p className="text-muted-foreground">
            Have a project in mind or want to discuss engineering challenges? Let's talk.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bento-card"
        >
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
              <p className="text-muted-foreground mb-6">I'll get back to you within 24 hours.</p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>Send Another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-500 text-sm">
                  {serverError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Name" {...register("name")} error={errors.name?.message} placeholder="Jane Smith" />
                <Input label="Email" type="email" {...register("email")} error={errors.email?.message} placeholder="jane@example.com" />
              </div>
              <Input label="Subject (optional)" {...register("subject")} placeholder="Project inquiry" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Message</label>
                <textarea
                  {...register("message")}
                  rows={5}
                  placeholder="Tell me about your project..."
                  className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>
              <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                Send Message
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
