"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface AlgorithmVisualizerProps {
  array: number[];
  step: { type: string; i: number; j: number } | null;
  done: boolean;
  onStart: (algorithm: string) => void;
}

const ALGORITHMS = [
  { id: "bubble_sort", label: "Bubble Sort" },
  { id: "selection_sort", label: "Selection Sort" },
];

export function AlgorithmVisualizer({ array, step, done, onStart }: AlgorithmVisualizerProps) {
  const maxVal = Math.max(...array, 1);

  const getBarColor = (index: number) => {
    if (done) return "bg-green-500";
    if (step?.type === "swap" && (index === step.i || index === step.j)) return "bg-red-500";
    if (step?.type === "compare" && (index === step.i || index === step.j)) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="bento-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Algorithm Visualizer</h3>
        {done && (
          <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-500">Sorted!</span>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {ALGORITHMS.map((algo) => (
          <Button key={algo.id} variant="outline" size="sm" onClick={() => onStart(algo.id)}>
            {algo.label}
          </Button>
        ))}
      </div>

      <div className="flex h-48 items-end gap-0.5 overflow-hidden rounded-lg bg-muted/30 px-2 pb-2">
        <AnimatePresence mode="popLayout">
          {array.map((value, index) => (
            <motion.div
              key={`${index}-${value}`}
              layout
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              style={{ height: `${(value / maxVal) * 100}%` }}
              className={`flex-1 rounded-t transition-colors duration-100 ${getBarColor(index)}`}
              title={`${value}`}
            />
          ))}
        </AnimatePresence>
        {array.length === 0 && (
          <div className="flex w-full items-center justify-center text-muted-foreground text-sm">
            Select an algorithm to visualize
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-blue-500" /> Unsorted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-yellow-500" /> Comparing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-500" /> Swapping
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-500" /> Sorted
        </span>
      </div>
    </div>
  );
}
