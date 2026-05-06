"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useWebSocket } from "@/hooks/useWebSocket";
import { MetricsChart } from "./MetricsChart";
import { AlgorithmVisualizer } from "./AlgorithmVisualizer";
import { Button } from "@/components/ui/Button";

type VisualizerTab = "metrics" | "algorithms";

interface MetricPoint {
  timestamp: string;
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
}

export default function VisualizerDashboard() {
  const [activeTab, setActiveTab] = useState<VisualizerTab>("metrics");
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [algoData, setAlgoData] = useState<{
    array: number[];
    step: { type: string; i: number; j: number } | null;
    done: boolean;
  }>({ array: [], step: null, done: false });

  const activeEndpoint = activeTab === "metrics" ? "metrics" : "algorithms";

  const handleMessage = useCallback(
    (data: unknown) => {
      const msg = data as Record<string, unknown>;
      if (activeTab === "metrics" && msg.type === "metrics") {
        setMetrics((prev) =>
          [...prev, msg as unknown as MetricPoint].slice(-60)
        );
      } else if (activeTab === "algorithms") {
        if (msg.type === "init" || msg.type === "swap" || msg.type === "compare" || msg.type === "done") {
          setAlgoData({
            array: (msg.array as number[]) || [],
            step: msg.type !== "init" && msg.type !== "done" ? { type: msg.type as string, i: msg.i as number, j: msg.j as number } : null,
            done: msg.type === "done",
          });
        }
      }
    },
    [activeTab]
  );

  const { status, send } = useWebSocket({
    endpoint: activeEndpoint,
    onMessage: handleMessage,
  });

  const startAlgorithm = (algo: string) => {
    setAlgoData({ array: [], step: null, done: false });
    send({ algorithm: algo, size: 30 });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold gradient-text">Real-Time Visualizer</h1>
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                status === "connected" ? "bg-green-500 animate-pulse" :
                status === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-muted-foreground capitalize">{status}</span>
          </div>
        </div>
        <p className="text-muted-foreground">
          WebSocket-powered live data visualization — connect to see real-time server metrics
          and interactive algorithm step-throughs.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {(["metrics", "algorithms"] as VisualizerTab[]).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "metrics" && <MetricsChart data={metrics} />}
        {activeTab === "algorithms" && (
          <AlgorithmVisualizer
            array={algoData.array}
            step={algoData.step}
            done={algoData.done}
            onStart={startAlgorithm}
          />
        )}
      </motion.div>
    </div>
  );
}
