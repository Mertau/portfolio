"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Navigation } from "@/components/layout/Navigation";

const VisualizerDashboard = dynamic(
  () => import("@/components/visualizer/VisualizerDashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading visualizer...</p>
        </div>
      </div>
    ),
  }
);

export default function VisualizerPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <Suspense>
          <VisualizerDashboard />
        </Suspense>
      </div>
    </main>
  );
}
